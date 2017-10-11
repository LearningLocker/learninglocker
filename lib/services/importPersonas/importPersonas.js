import mongoose from 'mongoose';
import PersonasImport from 'lib/models/personasImport';
import * as filesService from 'lib/services/files';
import csv from 'fast-csv';
import highland from 'highland';
import proccessData from './importPersona';

const objectId = mongoose.Types.ObjectId;

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

  const proccessDataFn = proccessData({
    structure,
    personaService,
    organisation
  });

  const proccessPromise = highland(csvStream)
    .flatMap((data) => {
      return highland(proccessDataFn(data));
    })
    .collect()
    .toPromise(Promise);

  filesService.downloadToStream(csvHandle)(csvStream);

  await proccessPromise;
};

export default importPersonas;
