import testId from 'api/routes/tests/utils/testId';
import { expect } from 'chai';
import setup from 'api/routes/tests/utils/setup';
import * as routes from 'lib/constants/routes';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';
import getPersonaService from 'lib/connections/personaService';

describe('getPresonaAttribute', () => {
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

  it('Should get a single persona attribute', async () => {
    const { persona } = await personaService.createPersona({
      organisation: testId,
      name: 'Dave'
    });

    const { attribute } = await personaService.overwritePersonaAttribute({
      key: 'hair',
      value: 'brown',
      organisation: testId,
      personaId: persona.id
    });

    const result = await apiApp.get(
      routes.PERSONA_ATTRIBUTE_ID.replace(':personaAttributeId', attribute.id)
    )
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(result.body.key).to.equal('hair');
    expect(result.body.value).to.equal('brown');
    expect(result.body._id).to.equal(attribute.id);
    expect(result.body.personaId).to.equal(persona.id);
    expect(result.body.organisation).to.equal(testId);
  });
});
