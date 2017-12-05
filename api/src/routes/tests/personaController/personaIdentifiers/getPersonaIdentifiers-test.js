import testId from 'api/routes/tests/utils/testId';
import { MongoClient } from 'mongodb';
import { expect } from 'chai';
import mongoModelsRepo from 'personas/dist/mongoModelsRepo';
import config from 'personas/dist/config';
import createPersonaService from 'personas/dist/service';
import setup from 'api/routes/tests/utils/setup';
import * as routes from 'lib/constants/routes';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';

describe('getPresonaIdentifiers', () => {
  const apiApp = setup();
  let token;

  let personaService;

  let identifier;
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

    const { identifier: tempIdentifier } = await personaService.createIdentifier({
      ifi: {
        key: 'mbox',
        value: 'test@test.com'
      },
      organisation: testId,
      persona: persona.id
    });
    identifier = tempIdentifier;

    const { persona: persona2 } = await personaService.createPersona({
      organisation: testId,
      name: 'Dave 2'
    });

    await personaService.createIdentifier({
      ifi: {
        key: 'mbox',
        value: 'test2@test.com'
      },
      organisation: testId,
      persona: persona2.id
    });
  });

  after(async () => {
    await personaService.clearService();
  });

  it('Should get persona identifiers', async () => {
    const result = await apiApp.get(routes.PERSONA_IDENTIFIER)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(result.body[0].ifi.key).to.equal('mbox');
    expect(result.body[0].ifi.value).to.equal('test@test.com');
    expect(result.body[0].id).to.equal(identifier.id);
    expect(result.body[0].persona).to.equal(persona.id);
    expect(result.body[0].organisation).to.equal(testId);
    expect(result.body.length).to.equal(2);
  });

  it('should only get identifiers for provided persona', async () => {
    const result = await apiApp.get(routes.PERSONA_IDENTIFIER)
      .set('Authorization', `Bearer ${token}`)
      .query({
        persona: persona.id
      })
      .expect(200);

    expect(result.body.length).to.equal(1);
  });
});
