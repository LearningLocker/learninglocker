import testId from 'api/routes/tests/utils/testId';
import { expect } from 'chai';
import setup from 'api/routes/tests/utils/setup';
import * as routes from 'lib/constants/routes';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';
import getPersonaService from 'lib/connections/personaService';

describe('personaController addPersona', () => {
  const apiApp = setup();
  let token;
  const personaService = getPersonaService();

  beforeEach(async () => {
    token = await createOrgToken();
    await personaService.clearService();
  });

  after(async () => {
    await personaService.clearService();
  });

  it('should create a persona', async () => {
    const result = await apiApp.post(routes.PERSONA)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Dave'
      })
      .expect(200);

    expect(result.body.name).to.equal('Dave');

    const { persona } = await personaService.getPersona({
      organisation: testId,
      personaId: result.body._id
    });

    expect(persona.name).to.equal('Dave');
  });

  it('should create a persona with no body', async () => {
    const result = await apiApp.post(routes.PERSONA)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(result.body.name).to.equal(undefined);

    const { persona } = await personaService.getPersona({
      organisation: testId,
      personaId: result.body._id
    });

    expect(persona.name).to.equal(undefined);
    expect(persona.id).to.equal(result.body._id);
  });
});
