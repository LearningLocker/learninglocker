import testId from 'api/routes/tests/utils/testId';
import { expect } from 'chai';
import setup from 'api/routes/tests/utils/setup';
import * as routes from 'lib/constants/routes';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';
import getPersonaService from 'lib/connections/personaService';


describe('personaController postIdentifier', () => {
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


  it('should create an identifier', async () => {
    const { persona } = await personaService.createPersona({
      organisation: testId,
      name: 'Dave'
    });

    const result = await apiApp.post(routes.PERSONA_IDENTIFIER)
      .set('Authorization', `Bearer ${token}`)
      .send({
        ifi: {
          key: 'account',
          value: {
            homePage: 'test@test.com',
            name: 'test'
          }
        },
        persona: persona.id
      })
      .expect(200);

    expect(result.body.ifi.value.homePage).to.equal('test@test.com');
    expect(result.body.ifi.value.name).to.equal('test');
    expect(result.body.ifi.key).to.equal('account');
    expect(result.body.persona).to.equal(persona.id);
  });
});
