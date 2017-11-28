import testId from 'api/routes/tests/utils/testId';
import { MongoClient } from 'mongodb';
import mongoModelsRepo from 'personas/dist/mongoModelsRepo';
import config from 'personas/dist/config';
import createPersonaService from 'personas/dist/service';
import setup from 'api/routes/tests/utils/setup';
import * as routes from 'lib/constants/routes';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';

describe.only('patchPresonaAttributes', () => {
  const apiApp = setup();
  let token;

  let personaService;

  let attribute;
  let persona;
  before(async () => {
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
      persona: persona.id
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
      })
      .expect(200);
    process.exit();
  });
});
