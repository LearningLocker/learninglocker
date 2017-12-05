import testId from 'api/routes/tests/utils/testId';
import { MongoClient } from 'mongodb';
import { expect } from 'chai';
import mongoModelsRepo from 'personas/dist/mongoModelsRepo';
import config from 'personas/dist/config';
import createPersonaService from 'personas/dist/service';
import setup from 'api/routes/tests/utils/setup';
import * as routes from 'lib/constants/routes';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';


describe('personaController postIdentifier', () => {
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


  it('should create an identifier', async () => {
    const { persona } = await personaService.createPersona({
      organisation: testId,
      name: 'Dave'
    });

    const result = await apiApp.post(routes.PERSONA_IDENTIFIER)
      .set('Authorization', `Bearer ${token}`)
      .send({
        ifi: {
          key: 'account',
          value: {
            homePage: 'test@test.com',
            name: 'test'
          }
        },
        persona: persona.id
      })
      .expect(200);

    expect(result.body.ifi.value.homePage).to.equal('test@test.com');
    expect(result.body.ifi.value.name).to.equal('test');
    expect(result.body.ifi.key).to.equal('account');
    expect(result.body.persona).to.equal(persona.id);
  });
});
