import mongoose from 'mongoose';
import PersonasImport from 'lib/models/personasImport';
import * as filesService from 'lib/services/files';
import csv from 'fast-csv';
import {
  getPersonaName,
  getIfis
} from 'lib/helpers/personasImport';

const objectId = mongoose.Types.ObjectId;

const proccessData = ({
  structure,
  organisation,
  personaService
}) => row => {
  console.log('001 SUCCESS');
  console.log('001.1 csvData', csvData);

  const personaName = getPersonaName({
    structure,
    row
  });

  const ifis =  getIfis({
    structure,
    row
  });

  // const {
  //   personaId,
  //   identifierId,
  // } = await personaService.createUpdateIdentifierPersona({
  //   organisation,
  //   personaName: ???,
  //   ifi: ???
  // })
};

// does the import
const importPersonas = async ({
  id,
  personaService
}) => {
  // The model
  const model = await PersonasImport.findOne({
    _id: objectId(id)
  });

  const {
    structure,
    csvHandle,
    organisation
  } = model;

  // Fast csv
  const csvStream = csv.parse({
    headers: true,
    quoteHeaders: true
  });

  csvStream.on('data',
    proccessData({
      structure,
      personaService,
      organisation
    })
  );

  const csvPromise = new Promise((resolve, reject) => {
    csvStream.on('error', reject);
    csvStream.on('finish', resolve);
  });

  filesService.downloadToStream(csvHandle)(csvStream);

  await csvPromise;
};

export default importPersonas;
