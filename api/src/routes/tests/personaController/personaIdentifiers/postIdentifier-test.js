import testId from 'api/routes/tests/utils/testId';
import { MongoClient } from 'mongodb';
import { expect } from 'chai';
import mongoModelsRepo from 'personas/dist/mongoModelsRepo';
import config from 'personas/dist/config';
import createPersonaService from 'personas/dist/service';
import setup from 'api/routes/tests/utils/setup';
import * as routes from 'lib/constants/routes';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';

describe('updatePresonaIdentifier', () => {
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
