import testId from 'api/routes/tests/utils/testId';
import getPersonaService from 'lib/connections/personaService';
import setup from 'api/routes/tests/utils/setup';
import * as routes from 'lib/constants/routes';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';

describe('deletePresonaAttribute', () => {
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

  it('should delete a persona attribute', async () => {
    const { persona } = await personaService.createPersona({
      organisation: testId,
      name: 'Dave'
    });

    const { attribute } = await personaService.overwritePersonaAttribute({
      key: 'test1',
      value: 'test2',
      organisation: testId,
      personaId: persona.id
    });

    await apiApp.delete(
      routes.PERSONA_ATTRIBUTE_ID.replace(':personaAttributeId', attribute.id)
    ).set('Authorization', `Bearer ${token}`)
      .expect(204);
  }).timeout(5000);
});
