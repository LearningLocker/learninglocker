import mongoose from 'mongoose';
import { promisify } from 'bluebird';
import { expect } from 'chai';
import PersonaDBHelper from 'lib/classes/PersonasDBHelper';
import createPersonaService from 'personas/dist/service';
import mongoModelsRepo from 'personas/dist/mongoModelsRepo';
import config from 'personas/dist/config';
import { MongoClient } from 'mongodb';
import identifierHasStatements from '../identifierHasStatements';

const objectId = mongoose.Types.ObjectId;

describe.only('asignIdentifierStatements', () => {
  const db = new PersonaDBHelper();

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

  beforeEach('Set up people and statements for testing', async () => {
    await personaService.clearService();
    await promisify(db.cleanUp)();
  });

  afterEach('Clear db collections', async () => {
    await personaService.clearService();
    await promisify(db.cleanUp)();
  });

  it('should return true when identifier matches a statement', async () => {
    const { identifier } = await personaService.createUpdateIdentifierPersona({
      ifi: {
        key: 'mbox',
        value: 'test@ifi.com',
      },
      organisation: db.orgId,
      personaName: 'Test person',
    });

    const statement = await promisify(db.createStatement)(db.getStatementData(
      { organisation: db.orgId },
      { actor: { mbox: identifier.ifi.value } },
    ));

    const hasStatement = await identifierHasStatements({
      organisation: db.orgId,
      identifierId: identifier.id,
    });


    expect(hasStatement).to.equal(true);
  });

  it('should return false when identifier does not match a statement in the organisation', async () => {
    const otherOrg = objectId();
    const { identifier } = await personaService.createUpdateIdentifierPersona({
      ifi: {
        key: 'account',
        value: { homePage: 'http://test.com', name: 'testifi' },
      },
      organisation: db.orgId,
      personaName: 'Test person',
    });

    await personaService.createUpdateIdentifierPersona({
      ifi: {
        key: 'account',
        value: { homePage: 'http://test.com', name: 'testifi' },
      },
      organisation: otherOrg,
      personaName: 'Test person',
    });

    await promisify(db.createStatement)(db.getStatementData(
      { organisation: otherOrg },
      { actor: { account: identifier.ifi.value } },
    ));

    const hasStatement = await identifierHasStatements({
      organisation: db.orgId,
      identifierId: identifier.id,
    });


    expect(hasStatement).to.equal(false);
  });
});
