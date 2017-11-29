import testId from 'api/routes/tests/utils/testId';
import { MongoClient } from 'mongodb';
import { expect } from 'chai';
import mongoModelsRepo from 'personas/dist/mongoModelsRepo';
import config from 'personas/dist/config';
import createPersonaService from 'personas/dist/service';
import setup from 'api/routes/tests/utils/setup';
import * as routes from 'lib/constants/routes';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';

describe('personaController addPersona', () => {
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

  it('should create a persona', async () => {
    const result = await apiApp.post(routes.PERSONA)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Dave'
      })
      .expect(200);

    expect(result.body.name).to.equal('Dave');

    const { persona } = await personaService.getPersona({
      organisation: testId,
      personaId: result.body.id
    });

    expect(persona.name).to.equal('Dave');
  });

  it('should create a persona with no body', async () => {
    const result = await apiApp.post(routes.PERSONA)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(result.body.name).to.equal(undefined);

    const { persona } = await personaService.getPersona({
      organisation: testId,
      personaId: result.body.id
    });

    expect(persona.name).to.equal(undefined);
    expect(persona.id).to.equal(result.body.id);
  });
});
