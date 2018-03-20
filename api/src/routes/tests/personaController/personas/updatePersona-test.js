import testId from 'api/routes/tests/utils/testId';
import { expect } from 'chai';
import setup from 'api/routes/tests/utils/setup';
import * as routes from 'lib/constants/routes';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';
import getPersonaService from 'lib/connections/personaService';


describe('personaController update', () => {
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


  it('should update a persona', async () => {
    const { persona } = await personaService.createPersona({
      organisation: testId,
      name: 'Dave'
    });

    const result = await apiApp.patch(routes.PERSONA_ID.replace(/:personaId/, persona.id))
      .set('Authorization', `Bearer ${token}`)
      .send({
        personaId: persona.id,
        name: 'Dave+1'
      })
      .expect(200);

    expect(result.body.name).to.equal('Dave+1');

    const { persona: personaResult } = await personaService.getPersona({
      organisation: testId,
      personaId: persona.id
    });

    expect(personaResult.name).to.equal('Dave+1');
  });
});
