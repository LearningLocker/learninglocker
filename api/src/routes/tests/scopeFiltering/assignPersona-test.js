import * as routes from 'lib/constants/routes';
import { ALL, SITE_ADMIN } from 'lib/constants/scopes';
import { MANAGE_ALL_PERSONAS } from 'lib/constants/orgScopes';
import setup from 'api/routes/tests/utils/setup';
import createPersona from 'api/routes/tests/utils/models/createPersona';
import createIdent from 'api/routes/tests/utils/models/createIdent';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';
import createOwnerOrgToken from 'api/routes/tests/utils/tokens/createOwnerOrgToken';

describe('PersonaController.assignPersona scope filtering', () => {
  const apiApp = setup();

  const assignPersona = async ({ token, expectedCode }) => {
    const persona = await createPersona();
    const ident = await createIdent();
    return new Promise((resolve, reject) => {
      apiApp
        .post(routes.ASSIGN_PERSONA)
        .set('Authorization', `Bearer ${token}`)
        .query({
          personaId: persona._id.toString(),
          personaIdentifierId: ident._id.toString()
        })
        .expect(expectedCode)
        .end((err, res) => {
          if (err) return reject(err);
          resolve(res);
        });
    });
  };

  const assertUnauthorised = async token =>
    assignPersona({
      token,
      expectedCode: 403
    });

  const assertAuthorised = async token =>
    assignPersona({
      token,
      expectedCode: 200
    });

  it('should not allow action when no scopes are used', async () => {
    const token = await createOrgToken([]);
    await assertUnauthorised(token);
  });

  it('should allow action when ALL org scope is used', async () => {
    const token = await createOrgToken([ALL]);
    await assertAuthorised(token);
  });

  it('should allow action when MANAGE_ALL_PERSONAS org scope is used', async () => {
    const token = await createOrgToken([MANAGE_ALL_PERSONAS]);
    await assertAuthorised(token);
  });

  it('should not allow action when owner token is used', async () => {
    const token = await createOwnerOrgToken();
    await assertUnauthorised(token);
  });

  it('should allow action when SITE_ADMIN site scope is used', async () => {
    const token = await createOrgToken([], [SITE_ADMIN]);
    await assertAuthorised(token);
  });
});
