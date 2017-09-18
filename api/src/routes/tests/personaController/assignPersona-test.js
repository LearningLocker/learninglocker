import * as assert from 'assert';
import * as routes from 'lib/constants/routes';
import setup from 'api/routes/tests/utils/setup';
import createPersona from 'api/routes/tests/utils/models/createPersona';
import createIdent from 'api/routes/tests/utils/models/createIdent';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';

describe('PersonaController.assignPersona', () => {
  const apiApp = setup();

  const assignPersona = async ({ personaId, identId, expectedCode }) => {
    const token = await createOrgToken();
    return new Promise((resolve, reject) => {
      apiApp
        .post(routes.ASSIGN_PERSONA)
        .set('Authorization', `Bearer ${token}`)
        .query({ personaId, personaIdentifierId: identId })
        .expect(expectedCode)
        .end((err, res) => {
          if (err) return reject(err);
          resolve(res);
        });
    });
  };

  it('should assign a persona to a persona identifier', async () => {
    const persona = await createPersona();
    const ident = await createIdent();
    const res = await assignPersona({
      personaId: persona._id.toString(),
      identId: ident._id.toString(),
      expectedCode: 200
    });
    const personaIdentifier = res.body;
    assert.notEqual(personaIdentifier.persona, null);
  });

  it('should not assign a persona that does not exist', async () => {
    const ident = await createIdent();
    return assignPersona({
      personaId: '0000000aa0a000a00aa00000',
      identId: ident._id.toString(),
      expectedCode: 404
    });
  });

  it('should not assign a persona to a non-existing persona identifier', async () => {
    const persona = await createPersona();
    return assignPersona({
      personaId: persona._id.toString(),
      identId: '0000000aa0a000a00aa00000',
      expectedCode: 404
    });
  });
});
