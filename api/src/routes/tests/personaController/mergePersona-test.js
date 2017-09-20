import * as assert from 'assert';
import * as routes from 'lib/constants/routes';
import Persona from 'lib/models/persona';
import PersonaIdentifier from 'lib/models/personaidentifier';
import setup from 'api/routes/tests/utils/setup';
import createPersona from 'api/routes/tests/utils/models/createPersona';
import createIdent from 'api/routes/tests/utils/models/createIdent';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';

const TEST_MBOX_1 = 'mailto:test1@example.com';
const TEST_MBOX_2 = 'mailto:test2@example.com';
const TEST_NAME_1 = '1';
const TEST_NAME_2 = '2';

describe('PersonaController.mergePersona', () => {
  const apiApp = setup();

  const mergePersona = async ({
    mergePersonaFromId,
    mergePersonaToId,
    expectedCode
  }) => {
    const token = await createOrgToken();
    return new Promise((resolve, reject) => {
      apiApp
        .post(routes.MERGE_PERSONA)
        .set('Authorization', `Bearer ${token}`)
        .query({ mergePersonaFromId, mergePersonaToId })
        .expect(expectedCode)
        .end((err, res) => {
          if (err) return reject(err);
          resolve(res);
        });
    });
  };

  const assertFailedMerge = async ({
    mergePersonaFromId,
    mergePersonaToId,
    expectedCode
  }) => {
    await mergePersona({
      mergePersonaFromId,
      mergePersonaToId,
      expectedCode
    });

    const personasAfterMerge = (await Persona.find({}).exec()).length;
    assert.equal(personasAfterMerge, 1, 'Expected 1 persona after merge');

    const identsAfterMerge = (await PersonaIdentifier.find({}).exec()).length;
    assert.equal(identsAfterMerge, 1, 'Expected 1 ident after merge');
  };

  it('should merge a persona with another', async () => {
    const personas = await Promise.all([createPersona(), createPersona()]);
    await Promise.all([
      createIdent(personas[0]._id, TEST_MBOX_1, TEST_NAME_1),
      createIdent(personas[1]._id, TEST_MBOX_2, TEST_NAME_2)
    ]);

    const mergePersonaFromId = personas[0]._id.toString();
    const mergePersonaToId = personas[1]._id.toString();

    const res = await mergePersona({
      mergePersonaFromId,
      mergePersonaToId,
      expectedCode: 200
    });

    assert.equal(res.body.length, 1, 'Expected body to have 1 result');
    assert.equal(res.body[0].persona, mergePersonaToId);

    const personasAfterMerge = (await Persona.find({}).exec()).length;
    assert.equal(personasAfterMerge, 1, 'Expected 1 persona after merge');

    const identsAfterMerge = (await PersonaIdentifier.find({}).exec()).length;
    assert.equal(identsAfterMerge, 2, 'Expected 2 idents after merge');
  });

  it('should not merge an existing persona into a non existing one', async () => {
    const persona = await createPersona();
    await createIdent(persona._id, TEST_MBOX_1, TEST_NAME_1);
    await assertFailedMerge({
      mergePersonaFromId: persona._id.toString(),
      mergePersonaToId: '0000000aa0a000a00aa00000',
      expectedCode: 500
    });
  });

  it('should not merge a non existing persona into an existing one', async () => {
    const persona = await createPersona();
    await createIdent(persona._id, TEST_MBOX_1, TEST_NAME_1);

    await assertFailedMerge({
      mergePersonaFromId: '0000000aa0a000a00aa00000',
      mergePersonaToId: persona._id.toString(),
      expectedCode: 500
    });
  });

  it('should not merge a persona into itself', async () => {
    const persona = await createPersona();
    await createIdent(persona._id, TEST_MBOX_1, TEST_NAME_1);

    await assertFailedMerge({
      mergePersonaFromId: persona._id.toString(),
      mergePersonaToId: persona._id.toString(),
      expectedCode: 500
    });
  });
});
