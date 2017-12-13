import testId from 'api/routes/tests/utils/testId';
import { expect } from 'chai';
import setup from 'api/routes/tests/utils/setup';
import * as routes from 'lib/constants/routes';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';
import getPersonaService from 'lib/connections/personaService';

describe('updatePresonaIdentifier', () => {
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

  it('Should update an identifier (but only the persona)', async () => {
    const { persona } = await personaService.createPersona({
      organisation: testId,
      name: 'Dave'
    });

    const { persona: persona2 } = await personaService.createPersona({
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

    const result = await apiApp.post(
      routes.PERSONA_IDENTIFIER_ID.replace(':personaIdentifierId', identifier.id)
    )
      .set('Authorization', `Bearer ${token}`)
      .send({
        ifi: {
          key: 'mbox',
          value: 'test2@test2.com'
        },
        persona: persona2.id
      })
      .expect(200);

    // ident should still have the same ifi
    expect(result.body.ifi.key).to.equal(identifier.ifi.key);
    expect(result.body.ifi.value).to.equal(identifier.ifi.value);
    // but persona should have changed
    expect(result.body.persona).to.equal(persona2.id);
  });
});
