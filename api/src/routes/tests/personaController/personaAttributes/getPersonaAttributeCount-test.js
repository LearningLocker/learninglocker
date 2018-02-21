import testId from 'api/routes/tests/utils/testId';
import { expect } from 'chai';
import setup from 'api/routes/tests/utils/setup';
import * as routes from 'lib/constants/routes';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';
import getPersonaService from 'lib/connections/personaService';

describe('personaController getPersonaAttributeCount', () => {
  const apiApp = setup();
  let token;
  const personaService = getPersonaService();

  before(async () => {
    token = await createOrgToken();
  });

  beforeEach(async () => {
    await personaService.clearService();
  });

  after(async () => {
    await personaService.clearService();
  });


  it('should get the right count', async () => {
    const { persona } = await personaService.createPersona({
      organisation: testId,
      name: 'Dave1'
    });

    await personaService.overwritePersonaAttribute({
      organisation: testId,
      key: 'test1',
      value: 'test1',
      personaId: persona.id
    });

    await personaService.overwritePersonaAttribute({
      organisation: testId,
      key: 'test2',
      value: 'test2',
      personaId: persona.id
    });

    const result = await apiApp.get(routes.PERSONA_ATTRIBUTE_COUNT)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(result.body.count).to.equal(2);
  });
});
