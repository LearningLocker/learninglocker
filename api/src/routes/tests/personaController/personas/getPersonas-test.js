import testId from 'api/routes/tests/utils/testId';
import { expect } from 'chai';
import getPersonaService from 'lib/connections/personaService';
import setup from 'api/routes/tests/utils/setup';
import * as routes from 'lib/constants/routes';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';

describe('getPersonas', () => {
  const apiApp = setup();
  let token;
  const personaService = getPersonaService();

  beforeEach(async () => {
    await personaService.clearService();

    token = await createOrgToken();

    await personaService.createPersona({
      organisation: testId,
      name: 'Dave'
    });
  });

  after(async () => {
    await personaService.clearService();
  });

  it('Should get personas', async () => {
    const result = await apiApp.get(routes.PERSONA)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(result.body[0].name).to.equal('Dave');
    expect(result.body.length).to.equal(1);
  });
});
