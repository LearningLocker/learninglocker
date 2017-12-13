import testId from 'api/routes/tests/utils/testId';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import setup from 'api/routes/tests/utils/setup';
import * as routes from 'lib/constants/routes';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';
import getPersonaService from 'lib/connections/personaService';

chai.use(chaiAsPromised);

describe('personaController deletePersona', () => {
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

  it('should delete a persona', async () => {
    const { persona } = await personaService.createPersona({
      organisation: testId,
      name: 'Dave'
    });

    await apiApp.delete(routes.PERSONA_ID.replace(/:personaId/, persona.id))
      .set('Authorization', `Bearer ${token}`)
      .expect(200);


    const getPersona = personaService.getPersona({
      organisation: testId,
      personaId: persona.id
    });

    return expect(getPersona).to.eventually.be.rejected;
  });
});
