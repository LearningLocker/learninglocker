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
  COLUMN_MBOX,
  COLUMN_OPENID
} from 'lib/constants/personasImport';
import { TEST_ORG_ID } from 'lib/services/auth/tests/utils/constants';
import { getConnection } from 'lib/connections/mongoose';
import awaitReadyConnection from 'api/routes/tests/utils/awaitReadyConnection';
import {
  MANAGE_ALL_PERSONASIMPORT
} from 'lib/constants/orgScopes';
import importPersonas from './importPersonas';

const objectId = mongoose.Types.ObjectId;

const connection = getConnection();

describe('import personas service', () => {
  const cleanUp = async () => {
    await PersonasImport.remove({});
    await connection.collection('personas').remove({});
    await connection.collection('personaIdentifiers').remove({});
  };

  const authInfo = {
    token: {
      tokenType: 'organisation',
      scopes: [MANAGE_ALL_PERSONASIMPORT],
      tokenId: TEST_ORG_ID
    }
  };

  beforeEach(async () => {
    await awaitReadyConnection(connection);

    await cleanUp();
  });

  after(async () => {
    await cleanUp();
  });

  let mongoClient;
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
    mongoClient = await mongoClientPromise;
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

    // # TEST

    await importPersonas({
      id,
      personaService,
      authInfo
    });

    const personas = await mongoClient
      .collection('personas')
      .find({})
      .toArray();

    expect(personas.length).to.equal(2);

    // How to delete from files service ???
  });

  it('should merge existing persona', async () => {
    const id = objectId();

    const structure = {
      testName: {
        columnType: COLUMN_NAME
      },
      mbox: {
        columnType: COLUMN_MBOX,
        primary: 1
      },
      openId: {
        columnType: COLUMN_OPENID,
        primary: 2
      }
    };

    const csvHandle = `${PERSONAS_CSV_PATH}/${id}.csv`;
    await uploadFromStream(
      csvHandle
    )(
      fs.createReadStream('./lib/services/importPersonas/__fixtures__/simpleImport2.csv')
    );

    await PersonasImport.create({
      _id: id,
      organisation: TEST_ORG_ID,
      structure,
      csvHandle
    });

    // Setup service
    await personaService.createUpdateIdentifierPersona({
      organisation: TEST_ORG_ID,
      ifi: {
        key: 'mbox',
        value: 'nameA@test.com'
      },
      personaName: 'nameA'
    });

    // # Test
    await importPersonas({
      id,
      personaService,
      authInfo
    });

    const { personaId: personaIdA } = await personaService.getIdentifierByIfi({
      organisation: TEST_ORG_ID,
      ifi: {
        key: 'mbox',
        value: 'nameA@test.com'
      }
    });
    const { personaId: personaIdB } = await personaService.getIdentifierByIfi({
      organisation: TEST_ORG_ID,
      ifi: {
        key: 'openid',
        value: '2'
      }
    });
    const { personaId: personaIdC } = await personaService.getIdentifierByIfi({
      organisation: TEST_ORG_ID,
      ifi: {
        key: 'openid',
        value: '3'
      }
    });
    expect(personaIdA).to.equal(personaIdC);
    expect(personaIdB).to.not.equal(personaIdA);

    const { persona: { name: nameA } } = await personaService.getPersona({
      organisation: TEST_ORG_ID,
      personaId: personaIdA
    });
    expect(nameA).to.equal('nameA');

    const { persona: { name: nameB } } = await personaService.getPersona({
      organisation: TEST_ORG_ID,
      personaId: personaIdB
    });
    expect(nameB).to.equal('nameB');
  });
});
