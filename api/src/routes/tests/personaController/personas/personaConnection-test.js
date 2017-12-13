import testId from 'api/routes/tests/utils/testId';
import { expect } from 'chai';
import setup from 'api/routes/tests/utils/setup';
import * as routes from 'lib/constants/routes';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';
import getPersonaService from 'lib/connections/personaService';

describe('personaController personaConnection', () => {
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


  it('should get a persona', async () => {
    await personaService.createPersona({
      organisation: testId,
      name: 'Dave'
    });

    const result = await apiApp.get(routes.CONNECTION_PERSONA)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(result.body.edges[0].node.name).to.equal('Dave');
    expect(result.body.edges.length).to.equal(1);
  });
});
