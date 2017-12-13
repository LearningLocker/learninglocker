import testId from 'api/routes/tests/utils/testId';
import { expect } from 'chai';
import setup from 'api/routes/tests/utils/setup';
import * as routes from 'lib/constants/routes';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';
import getPersonaService from 'lib/connections/personaService';


describe('personaController getIdentifiers', () => {
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


  it('should get identifiers', async () => {
    const { persona } = await personaService.createPersona({
      organisation: testId,
      name: 'Dave'
    });

    await personaService.createIdentifier({
      ifi: {
        key: 'mbox',
        value: 'test@test.com'
      },
      organisation: testId,
      persona: persona.id
    });

    const result = await apiApp.get(routes.CONNECTION_PERSONA_IDENTIFIER)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(result.body.edges[0].node.persona).to.equal(persona.id);
    expect(result.body.edges[0].node.ifi.value).to.equal('test@test.com');
  });

  it('should get identifiers by persona', async () => {
    const { persona: persona1 } = await personaService.createPersona({
      organisation: testId,
      name: 'Dave'
    });

    await personaService.createIdentifier({
      ifi: {
        key: 'mbox',
        value: 'test@test.com'
      },
      organisation: testId,
      persona: persona1.id
    });

    const { persona: persona2 } = await personaService.createPersona({
      organisation: testId,
      name: 'Dave'
    });

    await personaService.createIdentifier({
      ifi: {
        key: 'mbox',
        value: 'test2@test.com'
      },
      organisation: testId,
      persona: persona2.id
    });

    const result = await apiApp.get(routes.CONNECTION_PERSONA_IDENTIFIER)
      .set('Authorization', `Bearer ${token}`)
      .query({ filter: JSON.stringify({
        persona: persona2.id
      }) })
      .expect(200);


    expect(result.body.edges[0].node.persona).to.equal(persona2.id);
    expect(result.body.edges[0].node.ifi.value).to.equal('test2@test.com');
    expect(result.body.edges.length).to.equal(1);
  });
});
