import testId from 'api/routes/tests/utils/testId';
import { expect } from 'chai';
import setup from 'api/routes/tests/utils/setup';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';
import getPersonaService from 'lib/connections/personaService';


describe('personaController getPersonaOnly', () => {
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


  it('should get a single persona', async () => {
    const { persona } = await personaService.createPersona({
      organisation: testId,
      name: 'Dave'
    });

    const result = await apiApp.get(`/v2/persona/${persona.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(result.body.name).to.equal('Dave');
  });

  it('should get multiple personas', async () => {
    await personaService.createPersona({
      organisation: testId,
      name: 'Dave1'
    });
    await personaService.createPersona({
      organisation: testId,
      name: 'Dave2'
    });

    const result = await apiApp.get('/v2/persona')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(result.body.length).to.equal(2);
  });
});
