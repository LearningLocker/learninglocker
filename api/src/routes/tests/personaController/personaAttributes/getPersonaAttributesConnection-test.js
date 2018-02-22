import testId from 'api/routes/tests/utils/testId';
import { expect } from 'chai';
import setup from 'api/routes/tests/utils/setup';
import * as routes from 'lib/constants/routes';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';
import getPersonaService from 'lib/connections/personaService';


describe('personaController getAttributesConnection', () => {
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


  it('should get attributes', async () => {
    const { persona } = await personaService.createPersona({
      organisation: testId,
      name: 'Dave'
    });

    await personaService.overwritePersonaAttribute({
      organisation: testId,
      personaId: persona.id,
      key: 'hair',
      value: 'blond',
    });

    const result = await apiApp.get(routes.CONNECTION_PERSONA_ATTRIBUTE)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(result.body.edges[0].node.value).to.equal('blond');
  });

  it('should get attributes by persona', async () => {
    const { persona: persona1 } = await personaService.createPersona({
      organisation: testId,
      name: 'Dave'
    });

    await personaService.overwritePersonaAttribute({
      key: 'hair',
      organisation: testId,
      personaId: persona1.id,
      value: 'brown'
    });

    const { persona: persona2 } = await personaService.createPersona({
      organisation: testId,
      name: 'Dave'
    });

    await personaService.overwritePersonaAttribute({
      key: 'hair',
      value: 'blond',
      organisation: testId,
      personaId: persona2.id
    });

    const result = await apiApp.get(routes.CONNECTION_PERSONA_ATTRIBUTE)
      .set('Authorization', `Bearer ${token}`)
      .query({ filter: JSON.stringify({
        personaId: persona2.id
      }) })
      .expect(200);


    expect(result.body.edges[0].node.value).to.equal('blond');
    expect(result.body.edges.length).to.equal(1);
  });
});
