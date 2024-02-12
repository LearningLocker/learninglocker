import testId from 'api/routes/tests/utils/testId';
import * as assert from 'assert';
import * as routes from 'lib/constants/routes';
import setup from 'api/routes/tests/utils/setup';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';
import { ALL } from 'lib/constants/scopes';
import NoModel from 'jscommons/dist/errors/NoModel';
import getPersonaService from 'lib/connections/personaService';


const assertError = (expectedConstructor, promise) => promise.then(() => {
  assert(false, 'Expected an error to be thrown');
}, (err) => {
  if (err instanceof expectedConstructor) {
    return;
  }
  const x = new Error('Expected a different error constructor');
  x.stack = err.stack;
  throw x;
});

describe('PersonaController.mergePersona', () => {
  let token;
  const personaService = getPersonaService();

  beforeEach(async () => {
    token = await createOrgToken([ALL], [], testId);
    await personaService.clearService();
  });

  after(async () => {
    await personaService.clearService();
  });

  const apiApp = setup();

  const mergePersona = async ({
    mergePersonaFromId,
    mergePersonaToId,
    expectedCode
  }) => new Promise((resolve, reject) => {
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

    // const personasAfterMerge = (await Persona.find({}).exec()).length;
    // assert.equal(personasAfterMerge, 1, 'Expected 1 persona after merge');

    // const identsAfterMerge = (await PersonaIdentifier.find({}).exec()).length;
    // assert.equal(identsAfterMerge, 1, 'Expected 1 ident after merge');
  };

  it('should merge two people', async () => {
    const ifi1 = { key: 'mbox', value: 'mailto:A1@test.com' };
    const ifi2 = { key: 'mbox', value: 'mailto:A2@test.com' };
    const organisation = testId;
    const { personaId: personaAId } = await personaService.createUpdateIdentifierPersona({
      organisation,
      personaName: 'A',
      ifi: ifi1
    });

    const { personaId: personaA2Id } = await personaService.createUpdateIdentifierPersona({
      organisation,
      personaName: 'A2',
      ifi: ifi2
    });

    await mergePersona({
      mergePersonaFromId: personaA2Id,
      mergePersonaToId: personaAId,
      expectedCode: 200
    });

    const personaA2Promise = personaService.getPersona({
      organisation,
      personaId: personaA2Id
    });
    assertError(NoModel, personaA2Promise);

    // check person still exists
    await personaService.getPersona({
      organisation,
      personaId: personaAId
    });

    const { ifis } = await personaService.getIfisByPersona({
      organisation,
      persona: personaAId
    });

    assert.deepEqual(ifis, [ifi1, ifi2]);
  });

  it('should not merge an existing persona into a non existing one', async () => {
    const { persona } = await personaService.createPersona({
      organisation: testId,
      name: 'Dave'
    });

    await personaService.createIdentifier({
      ifi: {
        key: 'mbox',
        value: 'test@test.com'
      },
      organisation: testId,
      persona: persona.id
    });

    await assertFailedMerge({
      mergePersonaFromId: persona.id.toString(),
      mergePersonaToId: '0000000aa0a000a00aa00000',
      expectedCode: 404
    });
  });

  it('should merge a non existing persona into an existing one', async () => {
    const { persona } = await personaService.createPersona({
      organisation: testId,
      name: 'Dave'
    });

    await personaService.createIdentifier({
      ifi: {
        key: 'mbox',
        value: 'test@test.com'
      },
      organisation: testId,
      persona: persona.id
    });

    await mergePersona({
      mergePersonaFromId: '0000000aa0a000a00aa00000',
      mergePersonaToId: persona.id.toString(),
      expectedCode: 200
    });
  });

  it('should not merge a persona into itself', async () => {
    const { persona } = await personaService.createPersona({
      organisation: testId,
      name: 'Dave'
    });

    await assertFailedMerge({
      mergePersonaFromId: persona.id,
      mergePersonaToId: persona.id,
      expectedCode: 500
    });
  });
});
