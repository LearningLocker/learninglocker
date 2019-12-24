import fs from 'fs';
import mongoose from 'mongoose';
import { uploadFromStream, downloadToStream } from 'lib/services/files/storage';
import PersonasImport from 'lib/models/personasImport';
import { PERSONAS_CSV_PATH } from 'lib/services/importPersonas/persistPersonas';
import highland from 'highland';
import * as csv from 'fast-csv';
import { expect } from 'chai';
import {
  COLUMN_NAME,
  COLUMN_FIRST_NAME,
  COLUMN_LAST_NAME,
  COLUMN_MBOX,
  COLUMN_OPENID,
  STAGE_IMPORTED
} from 'lib/constants/personasImport';
import { TEST_ORG_ID } from 'lib/services/auth/tests/utils/constants';
import { getConnection } from 'lib/connections/mongoose';
import awaitReadyConnection from 'api/routes/tests/utils/awaitReadyConnection';
import getPersonaService from 'lib/connections/personaService';
import {
  MANAGE_ALL_PERSONAS
} from 'lib/constants/orgScopes';
import importPersonasWorker from 'worker/handlers/importPersonas';
import { unsubscribeAll } from 'lib/services/queue';
import createDummyOrgAuthInfo from 'lib/helpers/createDummyOrgAuthInfo';
import importPersonas, { addErrorsToCsv } from './importPersonas';

const objectId = mongoose.Types.ObjectId;

const connection = getConnection();

describe('import personas service', () => {
  const cleanUp = async () => {
    await PersonasImport.deleteMany({});
    await connection.collection('personas').deleteMany({});
    await connection.collection('personaIdentifiers').deleteMany({});
  };

  const authInfo = createDummyOrgAuthInfo(TEST_ORG_ID, [MANAGE_ALL_PERSONAS]);


  beforeEach(async () => {
    await awaitReadyConnection(connection);
    await cleanUp();
  });

  after(async () => {
    await cleanUp();
  });

  afterEach(async () => {
    await unsubscribeAll();
  });

  const personaService = getPersonaService();

  it('should successfully import a persona', async () => {
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
      csvHandle,
      csvErrorHandle: csvHandle
    });

    // setup queue

    const onProcessedPromise = new Promise((resolve) => {
      importPersonasWorker({
        onProcessed: async () => {
          const processedPersonaImport = await PersonasImport
            .findOne({
              _id: id
            });
          if (processedPersonaImport.importStage === STAGE_IMPORTED) {
            resolve();
          }
        }
      });
    });

    // # TEST
    const { importPersonasPromise } = await importPersonas({
      id,
      personaService,
      authInfo
    });
    await importPersonasPromise;

    // Wait for the queues to process
    await onProcessedPromise;

    const personas = await connection
      .collection('personas')
      .find({})
      .toArray();

    expect(personas.length).to.equal(2);
  }).timeout(20000);

  it('should import create Full Name from First Name and Last Name', async () => {
    // # SETUP
    const id = objectId();

    const structure = {
      firstName: {
        columnType: COLUMN_FIRST_NAME,
      },
      lastName: {
        columnType: COLUMN_LAST_NAME,
      },
      mbox: {
        columnType: COLUMN_MBOX,
        primary: 1,
      },
    };

    const csvHandle = `${PERSONAS_CSV_PATH}/${id}.csv`;
    await uploadFromStream(
      csvHandle
    )(
      fs.createReadStream('./lib/services/importPersonas/__fixtures__/firstNameAndLastNameImport.csv')
    );

    await PersonasImport.create({
      _id: id,
      organisation: TEST_ORG_ID,
      structure,
      csvHandle,
      csvErrorHandle: csvHandle
    });

    // setup queue

    const onProcessedPromise = new Promise((resolve) => {
      importPersonasWorker({
        onProcessed: async () => {
          const processedPersonaImport = await PersonasImport
            .findOne({
              _id: id
            });
          if (processedPersonaImport.importStage === STAGE_IMPORTED) {
            resolve();
          }
        }
      });
    });

    // # TEST
    const { importPersonasPromise } = await importPersonas({
      id,
      personaService,
      authInfo
    });
    await importPersonasPromise;

    // Wait for the queues to process
    await onProcessedPromise;

    const personas = await connection
      .collection('personas')
      .find({})
      .toArray();

    expect(personas.length).to.equal(4);
    expect(personas[0].name).to.equal('firstA2 lastA2');
    expect(personas[1].name).to.equal('firstB lastB');
    expect(personas[2].name).to.equal('firstC');
    expect(personas[3].name).to.equal('lastD');
  }).timeout(20000);

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
      csvHandle,
      csvErrorHandle: csvHandle
    });

    // Setup service
    await personaService.createUpdateIdentifierPersona({
      organisation: TEST_ORG_ID,
      ifi: {
        key: 'mbox',
        value: 'mailto:nameA@test.com'
      },
      personaName: 'nameA'
    });

    const onProcessedPromise = new Promise((resolve) => {
      importPersonasWorker({
        onProcessed: async () => {
          const processedPersonaImport = await PersonasImport
            .findOne({
              _id: id
            });
          if (processedPersonaImport.importStage === STAGE_IMPORTED) {
            resolve();
          }
        }
      });
    });

    // # Test
    const { importPersonasPromise } = await importPersonas({
      id,
      personaService,
      authInfo
    });

    await importPersonasPromise;

    await onProcessedPromise;

    const { personaId: personaIdA } = await personaService.getIdentifierByIfi({
      organisation: TEST_ORG_ID,
      ifi: {
        key: 'mbox',
        value: 'mailto:nameA@test.com'
      }
    });
    const { personaId: personaIdB } = await personaService.getIdentifierByIfi({
      organisation: TEST_ORG_ID,
      ifi: {
        key: 'openid',
        value: 'http://2'
      }
    });
    const { personaId: personaIdC } = await personaService.getIdentifierByIfi({
      organisation: TEST_ORG_ID,
      ifi: {
        key: 'openid',
        value: 'http://3'
      }
    });
    expect(personaIdA).to.equal(personaIdC);
    expect(personaIdB).to.not.equal(personaIdA);

    const { persona: { name: nameA } } = await personaService.getPersona({
      organisation: TEST_ORG_ID,
      personaId: personaIdA
    });
    // should update to the last name in the CSV
    expect(nameA).to.equal('nameAB');

    const { persona: { name: nameB } } = await personaService.getPersona({
      organisation: TEST_ORG_ID,
      personaId: personaIdB
    });
    expect(nameB).to.equal('nameB');
  }).timeout(10000);

  describe('addErrorsToCsv', () => {
    it('Should add errors to the csv', async () => {
      const id = objectId();

      const csvHandle = `${PERSONAS_CSV_PATH}/${id}.csv`;
      await uploadFromStream(
        csvHandle
      )(
        fs.createReadStream('./lib/services/importPersonas/__fixtures__/invalidSimpleImport.csv')
      );

      const personasImport = {
        importErrors: [{
          row: 3,
          rowErrors: ['Invalid email']
        }]
      };

      await addErrorsToCsv({
        csvHandle,
        csvOutHandle: csvHandle,
        personasImport
      });

      // TEST

      const downloadCsvStream = csv.parse({
        headers: true,
        quoteHeaders: true
      });

      const csvPromise = highland(downloadCsvStream).map(
        data =>
          data
      ).collect()
        .toPromise(Promise);

      await downloadToStream(
        csvHandle
      )(downloadCsvStream);

      const result = await csvPromise;

      expect(result[2].errors).to.equal('Invalid email');
    });
  });
});
