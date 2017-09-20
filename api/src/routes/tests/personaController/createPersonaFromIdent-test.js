import * as assert from 'assert';
import * as routes from 'lib/constants/routes';
import setup from 'api/routes/tests/utils/setup';
import createIdent from 'api/routes/tests/utils/models/createIdent';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';

describe('PersonaController.createPersonaFromIdent', () => {
  const apiApp = setup();

  const createPersonaFromIdent = async ({ identId, expectedCode }) => {
    const token = await createOrgToken();
    return new Promise((resolve, reject) => {
      apiApp
        .post(routes.CREATE_PERSONA_FROM_IDENTIFIER)
        .set('Authorization', `Bearer ${token}`)
        .query({ personaIdentifierId: identId })
        .expect(expectedCode)
        .end((err, res) => {
          if (err) return reject(err);
          resolve(res);
        });
    });
  };

  it('should create a persona from a persona identifier', async () => {
    const ident = await createIdent();
    const res = await createPersonaFromIdent({
      identId: ident._id.toString(),
      expectedCode: 200
    });
    const personaIdentifier = res.body;
    assert.notEqual(personaIdentifier.persona, null);
  });

  it('should not create a persona for an identifier that does not exist', async () => {
    await createPersonaFromIdent({
      identId: '0000000aa0a000a00aa00000',
      expectedCode: 500
    });
  });
});
