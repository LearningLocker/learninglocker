import testId from 'api/routes/tests/utils/testId';
import setup from 'api/routes/tests/utils/setup';
import * as routes from 'lib/constants/routes';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';
import getPersonaService from 'lib/connections/personaService';

describe('patchPresonaAttributes', () => {
  const apiApp = setup();
  let token;
  const personaService = getPersonaService();

  let attribute;
  let persona;

  beforeEach(async () => {
    await personaService.clearService();

    token = await createOrgToken();
    const { persona: tempPersona } = await personaService.createPersona({
      organisation: testId,
      name: 'Dave'
    });
    persona = tempPersona;

    const { attribute: tempAttribute } = await personaService.overwritePersonaAttribute({
      key: 'testkey',
      value: 'testvalue',
      organisation: testId,
      personaId: persona.id
    });

    attribute = tempAttribute;
  });

  after(async () => {
    await personaService.clearService();
  });

  it('should update a persona', async () => {
    await apiApp.patch(routes.PERSONA_ATTRIBUTE_ID.replace(':personaAttributeId', attribute.id))
      .set('Authorization', `Bearer ${token}`)
      .send({
        key: 'test11',
        value: 'test12',
        personaId: persona.id,
      })
      .expect(200);
  });
});
