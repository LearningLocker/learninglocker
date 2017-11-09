import testId from 'api/routes/tests/utils/testId';
import createPersonaService from 'personas/dist/service';
import mongoModelsRepo from 'personas/dist/mongoModelsRepo';
import config from 'personas/dist/config';
import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';
import convert$personaIdent from 'lib/helpers/convert$personaIdent';
import { expect } from 'chai';

const objectId = mongoose.Types.ObjectId;

describe('convert$personaIdent', () => {
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
    await personaService.clearService();
  });

  after(async () => {
    await personaService.clearService();
  });

  it('should create a query with attribute', async () => {
    const personaId = objectId();

    personaService.overwritePersonaAttribute({
      organisation: testId,
      personaId,
      key: 'hair',
      value: 'blond'
    });

    const query = {
      $personaIdent: {
        key: 'persona.import.hair',
        value: 'blond'
      }
    };

    const result = await convert$personaIdent(query, {
      organisation: testId
    });

    expect(result.$in.toString()).to.equal(personaId.toString());
    expect(result.$in.length).to.equal(1);
  });

  it('should create a query without organisation', async () => {
    const query = {
      $personaIdent: {
        key: 'persona.import.hair',
        value: 'blond'
      }
    };

    const result = await convert$personaIdent(query);

    expect(result.$on.length).to.equal(0);
  });
});
