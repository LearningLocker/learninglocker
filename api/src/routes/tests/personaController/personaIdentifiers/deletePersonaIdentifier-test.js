import testId from 'api/routes/tests/utils/testId';
import { MongoClient } from 'mongodb';
import mongoModelsRepo from 'personas/dist/mongoModelsRepo';
import config from 'personas/dist/config';
import createPersonaService from 'personas/dist/service';
import setup from 'api/routes/tests/utils/setup';
import * as routes from 'lib/constants/routes';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';

describe('deletePersonaIdentifier', () => {
  const apiApp = setup();
  let token;

  let personaService;
  before(async () => {
    token = await createOrgToken();

    const mongoClientPromise = MongoClient.connect(
      process.env.MONGODB_PATH,
      config.mongoModelsRepo.options
    );
    personaService = createPersonaService({
      repo: mongoModelsRepo({
        db: mongoClientPromise
      })
    });
  });

  beforeEach(async () => {
    await personaService.clearService();
  });

  after(async () => {
    await personaService.clearService();
  });

  it('should delete a persona identifier', async () => {
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

    await apiApp.delete(
      routes.PERSONA_IDENTIFIER_ID.replace(':personaIdentifierId', identifier.id)
    ).set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});
