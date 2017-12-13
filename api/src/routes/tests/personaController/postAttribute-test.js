import testId from 'api/routes/tests/utils/testId';
import { MongoClient } from 'mongodb';
import { expect } from 'chai';
import mongoModelsRepo from 'personas/dist/mongoModelsRepo';
import config from 'personas/dist/config';
import createPersonaService from 'personas/dist/service';
import setup from 'api/routes/tests/utils/setup';
import * as routes from 'lib/constants/routes';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';

describe('personaController postAttribute', () => {
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

  it('should create an attribute', async () => {
    const { persona } = await personaService.createPersona({
      organisation: testId,
      name: 'Dave'
    });

    const result = await apiApp.post(routes.PERSONA_ATTRIBUTE)
      .set('Authorization', `Bearer ${token}`)
      .send({
        key: 'hair',
        value: 'brown',
        personaId: persona.id
      })
      .expect(200);

    expect(result.body.value).to.equal('brown');
    expect(result.body.key).to.equal('hair');
    expect(result.body.personaId).to.equal(persona.id);
  });
});
