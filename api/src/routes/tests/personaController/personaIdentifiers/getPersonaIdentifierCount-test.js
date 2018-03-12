import testId from 'api/routes/tests/utils/testId';
import { expect } from 'chai';
import setup from 'api/routes/tests/utils/setup';
import * as routes from 'lib/constants/routes';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';
import getPersonaService from 'lib/connections/personaService';

describe('personaController getPersonaIdentifierCount', () => {
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


  it('should get the right count', async () => {
    const { persona } = await personaService.createPersona({
      organisation: testId,
      name: 'Dave1'
    });

    await personaService.createIdentifier({
      organisation: testId,
      ifi: {
        key: 'mbox',
        varlue: 'test@test.com'
      },
      persona: persona.id
    });

    await personaService.createIdentifier({
      organisation: testId,
      ifi: {
        key: 'openid',
        varlue: '5'
      },
      persona: persona.id
    });

    const result = await apiApp.get(routes.PERSONA_IDENTIFIER_COUNT)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(result.body.count).to.equal(2);
  });
});
