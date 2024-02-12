import testId from 'api/routes/tests/utils/testId';
import { ObjectId } from 'mongodb';
import setup from 'api/routes/tests/utils/setup';
import * as routes from 'lib/constants/routes';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';
import { getConnection } from 'lib/connections/mongoose';
import getPersonaService from 'lib/connections/personaService';

describe('deletePersonaIdentifier', () => {
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

  it('should delete a persona identifier', async () => {
    const organisation = testId;
    const { persona } = await personaService.createPersona({
      organisation,
      name: 'Dave'
    });

    const { identifier } = await personaService.createIdentifier({
      ifi: {
        key: 'mbox',
        value: 'mailto:nostatements@withthisident.com'
      },
      organisation,
      persona: persona.id
    });

    await apiApp.delete(
      routes.PERSONA_IDENTIFIER_ID.replace(':personaIdentifierId', identifier.id)
    ).set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('should not delete a persona identifier when statements exist for the ident', async () => {
    const organisation = testId;
    const { persona } = await personaService.createPersona({
      organisation,
      name: 'Dave'
    });

    const ifi = {
      key: 'mbox',
      value: 'mailto:statementsexist@withthisident.com'
    };

    const { identifier } = await personaService.createIdentifier({
      ifi,
      organisation,
      persona: persona.id
    });

    const connection = getConnection();
    await connection.collection('statements').insert({
      organisation: new ObjectId(organisation),
      statement: {
        actor: { mbox: ifi.value }
      },
      personaIdentifier: new ObjectId(identifier.id),
      persona: new ObjectId(persona.id),
    });

    await apiApp.delete(
      routes.PERSONA_IDENTIFIER_ID.replace(':personaIdentifierId', identifier.id)
    ).set('Authorization', `Bearer ${token}`)
      .expect(400);
  });
});
