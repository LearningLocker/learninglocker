import Statement from 'lib/models/statement';
import mongoose from 'mongoose';
import { promisify } from 'bluebird';
import { expect } from 'chai';
import PersonaDBHelper from 'lib/classes/PersonasDBHelper';
import createPersonaService from 'personas/dist/service';
import mongoModelsRepo from 'personas/dist/mongoModelsRepo';
import config from 'personas/dist/config';
import { MongoClient } from 'mongodb';
import reasignPersonaStatements from '../reasignPersonaStatements';

const objectId = mongoose.Types.ObjectId;

describe('reasignPersonaStatements', () => {
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

  it('should reasgin persona statements', async () => {
    const personId = objectId();

    const statement = await promisify(db.createStatement)(db.getStatementData({
      person: {
        _id: personId
      }
    }));

    const { persona } = await personaService.createPersona({
      organisation: statement.organisation.toString(),
      name: 'Dave'
    });

    await reasignPersonaStatements({
      organisation: statement.organisation,
      fromId: personId.toString(),
      toId: persona.id
    });

    const finishedStatement = await Statement.findOne({
      _id: objectId(statement._id)
    });

    expect(finishedStatement.person._id.toString()).to.equal(persona.id);
    expect(finishedStatement.person.display).to.equal('Dave');
  });
});
