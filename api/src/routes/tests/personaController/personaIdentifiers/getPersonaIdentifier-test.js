import testId from 'api/routes/tests/utils/testId';
import { expect } from 'chai';
import setup from 'api/routes/tests/utils/setup';
import * as routes from 'lib/constants/routes';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';
import getPersonaService from 'lib/connections/personaService';

describe('getPresonaIdentifier', () => {
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

  it('Should get a single persona identifier', async () => {
    const { persona } = await personaService.createPersona({
      organisation: testId,
      name: 'Dave'
    });

    const { identifier } = await personaService.createIdentifier({
      ifi: {
        key: 'mbox',
        value: 'test@test.com'
      },
      organisation: testId,
      persona: persona.id
    });

    const result = await apiApp.get(
      routes.PERSONA_IDENTIFIER_ID.replace(':personaIdentifierId', identifier.id)
    )
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(result.body.ifi.key).to.equal('mbox');
    expect(result.body.ifi.value).to.equal('test@test.com');
    expect(result.body._id).to.equal(identifier.id);
    expect(result.body.persona).to.equal(persona.id);
    expect(result.body.organisation).to.equal(testId);
  });
});
