import testId from 'api/routes/tests/utils/testId';
import { expect } from 'chai';
import setup from 'api/routes/tests/utils/setup';
import * as routes from 'lib/constants/routes';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';
import getPersonaService from 'lib/connections/personaService';

describe('personaController postAttribute', () => {
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

  it('should create an attribute', async () => {
    const { persona } = await personaService.createPersona({
      organisation: testId,
      name: 'Dave'
    });

    const result = await apiApp.post(routes.PERSONA_ATTRIBUTE)
      .set('Authorization', `Bearer ${token}`)
      .send({
        key: 'hair',
        value: 'brown',
        personaId: persona.id
      })
      .expect(201);

    expect(result.body.value).to.equal('brown');
    expect(result.body.key).to.equal('hair');
    expect(result.body.personaId).to.equal(persona.id);
  });
});
