import testId from 'api/routes/tests/utils/testId';
import { MongoClient } from 'mongodb';
import { expect } from 'chai';
import mongoModelsRepo from 'personas/dist/mongoModelsRepo';
import config from 'personas/dist/config';
import createPersonaService from 'personas/dist/service';
import setup from 'api/routes/tests/utils/setup';
import * as routes from 'lib/constants/routes';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';


describe('personaController getPersonas', () => {
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


  it('should get a personas', async () => {
    await personaService.createPersona({
      organisation: testId,
      name: 'Dave'
    });

    const result = await apiApp.get(routes.CONNECTION_PERSONA)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    console.log('001', result.body);
    expect(result.body.edges[0].node.name).to.equal('Dave');
    expect(result.body.edges.length).to.equal(1);
  });
});
