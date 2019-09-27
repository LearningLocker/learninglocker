import testId from 'api/routes/tests/utils/testId';
import { expect } from 'chai';
import setup from 'api/routes/tests/utils/setup';
import * as routes from 'lib/constants/routes';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';
import getPersonaService from 'lib/connections/personaService';

describe('getPresonaAttributes', () => {
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

    const { persona: persona2 } = await personaService.createPersona({
      organisation: testId,
      name: 'Dave 2'
    });

    await personaService.overwritePersonaAttribute({
      key: 'testkey',
      value: 'testvalue',
      organisation: testId,
      personaId: persona2.id
    });
  });

  after(async () => {
    await personaService.clearService();
  });

  it('Should get persona attributes', async () => {
    const result = await apiApp.get(routes.PERSONA_ATTRIBUTE)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(result.body[0].key).to.equal('testkey');
    expect(result.body[0].value).to.equal('testvalue');
    expect(result.body[0]._id).to.equal(attribute.id);
    expect(result.body[0].personaId).to.equal(persona.id);
    expect(result.body[0].organisation).to.equal(testId);
    expect(result.body.length).to.equal(2);
  });

  it('should only get attributes for provided persona', async () => {
    const result = await apiApp.get(routes.PERSONA_ATTRIBUTE)
      .set('Authorization', `Bearer ${token}`)
      .query({
        query: JSON.stringify({ personaId: persona.id })
      })
      .expect(200);

    expect(result.body.length).to.equal(1);
  });
});
