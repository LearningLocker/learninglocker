import testId from 'api/routes/tests/utils/testId';
import { MongoClient } from 'mongodb';
import { expect } from 'chai';
import mongoModelsRepo from 'personas/dist/mongoModelsRepo';
import config from 'personas/dist/config';
import createPersonaService from 'personas/dist/service';
import setup from 'api/routes/tests/utils/setup';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';


describe('personaController getPersonaOnly', () => {
  const apiApp = setup();
  let token;

  let personaService;
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
    token = await createOrgToken();
    await personaService.clearService();
  });

  after(async () => {
    await personaService.clearService();
  });


  it('should get a single persona', async () => {
    const { persona } = await personaService.createPersona({
      organisation: testId,
      name: 'Dave'
    });

    const result = await apiApp.get(`/v2/persona/${persona.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(result.body.name).to.equal('Dave');
  });

  it('should get multiple personas', async () => {
    await personaService.createPersona({
      organisation: testId,
      name: 'Dave1'
    });
    await personaService.createPersona({
      organisation: testId,
      name: 'Dave2'
    });

    const result = await apiApp.get('/v2/persona')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(result.body.length).to.equal(2);
  });
});
