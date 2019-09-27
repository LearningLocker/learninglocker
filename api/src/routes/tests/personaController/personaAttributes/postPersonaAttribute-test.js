import testId from 'api/routes/tests/utils/testId';
import getPersonaService from 'lib/connections/personaService';
import { expect } from 'chai';
import setup from 'api/routes/tests/utils/setup';
import * as routes from 'lib/constants/routes';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';

describe('updatePersonaAttribute', () => {
  const apiApp = setup();
  const personaService = getPersonaService();

  beforeEach(async () => {
    await personaService.clearService();
  });

  after(async () => {
    await personaService.clearService();
  });

  it('Should create an attribute', async () => {
    const token = await createOrgToken();

    const { persona } = await personaService.createPersona({
      organisation: testId,
      name: 'Dave'
    });

    const result = await apiApp.post(
      routes.PERSONA_ATTRIBUTE
    )
      .set('Authorization', `Bearer ${token}`)
      .send({
        key: 'testkey',
        value: 'testvalue',
        personaId: persona.id
      })
      .expect(201);

    expect(result.body.key).to.equal('testkey');
    expect(result.body.value).to.equal('testvalue');
    expect(result.body.personaId).to.equal(persona.id);
  });

  it('Should update an attribute', async () => {
    const token = await createOrgToken();

    const { persona } = await personaService.createPersona({
      organisation: testId,
      name: 'Dave'
    });

    const { attribute } = await personaService.overwritePersonaAttribute({
      key: 'testkey',
      value: 'testvalue',
      organisation: testId,
      personaId: persona.id
    });

    const result = await apiApp.post(
      routes.PERSONA_ATTRIBUTE_ID.replace(':personaAttributeId', attribute.id)
    )
      .set('Authorization', `Bearer ${token}`)
      .send({
        key: 'testkey',
        value: 'testvalue',
        personaId: persona.id,
      })
      .expect(200);

    expect(result.body.key).to.equal('testkey');
    expect(result.body.value).to.equal('testvalue');
    expect(result.body.personaId).to.equal(persona.id);
  });
});
