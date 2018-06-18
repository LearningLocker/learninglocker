import testId from 'api/routes/tests/utils/testId';
import { expect } from 'chai';
import setup from 'api/routes/tests/utils/setup';
import * as routes from 'lib/constants/routes';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';
import getPersonaService from 'lib/connections/personaService';

describe('personaController getPersonaCount', () => {
  const apiApp = setup();
  let token;
  const personaService = getPersonaService();

  beforeEach(async () => {
    await personaService.clearService();
    token = await createOrgToken();
  });

  after(async () => {
    await personaService.clearService();
  });


  it('should get the right count', async () => {
    await personaService.createPersona({
      organisation: testId,
      name: 'Dave1'
    });
    await personaService.createPersona({
      organisation: testId,
      name: 'Dave1'
    });

    const result = await apiApp.get(routes.PERSONA_COUNT)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(result.body.count).to.equal(2);
  });
});
