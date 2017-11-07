import testId from 'api/routes/tests/utils/testId';
import { MongoClient } from 'mongodb';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import mongoModelsRepo from 'personas/dist/mongoModelsRepo';
import config from 'personas/dist/config';
import createPersonaService from 'personas/dist/service';
import setup from 'api/routes/tests/utils/setup';
import * as routes from 'lib/constants/routes';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';

chai.use(chaiAsPromised);

describe('personaController deletePersona', () => {
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

  it('should delete a persona', async () => {
    const { persona } = await personaService.createPersona({
      organisation: testId,
      name: 'Dave'
    });

    await apiApp.delete(routes.DELETE_PERSONA.replace(/:personaId/, persona.id))
      .set('Authorization', `Bearer ${token}`)
      .expect(200);


    const getPersona = personaService.getPersona({
      organisation: testId,
      personaId: persona.id
    });

    return expect(getPersona).to.eventually.be.rejected;
  });
});
