import fs from 'fs';
import mongoose from 'mongoose';
import { uploadFromStream } from 'lib/services/files/storage';
import PersonasImport from 'lib/models/personasImport';
import { PERSONAS_CSV_PATH } from 'lib/services/importPersonas/persistPersonas';
import createPersonaService from 'personas/dist/service';
import mongoModelsRepo from 'personas/dist/mongoModelsRepo';
import config from 'personas/dist/config';
import { MongoClient } from 'mongodb';
import { expect } from 'chai';
import {
  COLUMN_NAME,
  COLUMN_MBOX
} from 'lib/constants/personasImport';
import { TEST_ORG_ID } from 'lib/services/auth/tests/utils/constants';
// import { delay } from 'bluebird';
import { getConnection } from 'lib/connections/mongoose';
import awaitReadyConnection from 'api/routes/tests/utils/awaitReadyConnection';
import importPersonas from './importPersonas';

const objectId = mongoose.Types.ObjectId;

const connection = getConnection();

describe.only('import personas service', () => {
  beforeEach(async () => {
    await awaitReadyConnection(connection);

    await PersonasImport.remove({});
    await connection.collection('personas').remove({});
    await connection.collection('personaIdentifiers').remove({});
  });

  it('should successfuly import a persona', async () => {
    // # SETUP

    const id = objectId();

    const structure = {
      testName: {
        columnType: COLUMN_NAME
      },
      mbox: {
        columnType: COLUMN_MBOX,
        primary: 1
      }
    };

    const csvHandle = `${PERSONAS_CSV_PATH}/${id}.csv`;
    await uploadFromStream(
      csvHandle
    )(
      fs.createReadStream('./lib/services/importPersonas/__fixtures__/simpleImport.csv')
    );

    await PersonasImport.create({
      _id: id,
      organisation: TEST_ORG_ID,
      structure,
      csvHandle
    });

    // Setup service
    const mongoClientPromise = MongoClient.connect(
      process.env.MONGODB_PATH,
      config.mongoModelsRepo.options
    );
    const personaService = createPersonaService({
      repo: mongoModelsRepo({
        db: mongoClientPromise
      })
    });
    const mongoClient = await mongoClientPromise;

    // # TEST

    await importPersonas({
      id,
      personaService
    });

    const personas = await mongoClient
      .collection('personas')
      .find({})
      .toArray();

    expect(personas.length).to.equal(2);

    // How to delete from files service ???
  });
});
