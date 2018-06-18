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
    await personaService.migrate();
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
            homePage: 'http://example.org',
            name: 'test'
          }
        },
        persona: persona.id
      })
      .expect(200);

    expect(result.body.ifi.value.homePage).to.equal('http://example.org');
    expect(result.body.ifi.value.name).to.equal('test');
    expect(result.body.ifi.key).to.equal('account');
    expect(result.body.persona).to.equal(persona.id);
  });

  it('should not be able to duplicate an identifier', async () => {
    const { persona } = await personaService.createPersona({
      organisation: testId,
      name: 'Dave'
    });

    const ifi = {
      key: 'account',
      value: {
        homePage: 'http://example.org',
        name: 'test'
      }
    };

    await personaService.createIdentifier({
      organisation: testId,
      persona: persona.id,
      ifi
    });

    await apiApp.post(routes.PERSONA_IDENTIFIER)
      .set('Authorization', `Bearer ${token}`)
      .send({
        ifi: {
          key: ifi.key,
          value: {
            name: ifi.value.name,
            homePage: ifi.value.homePage,
          }
        },
        persona: persona.id
      })
      .expect(400);
  });
});
