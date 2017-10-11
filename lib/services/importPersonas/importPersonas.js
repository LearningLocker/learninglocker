import mongoose from 'mongoose';
import PersonasImport from 'lib/models/personasImport';
import * as filesService from 'lib/services/files';
import csv from 'fast-csv';
import { map } from 'bluebird';
import { head, tail } from 'lodash';
import {
  getPersonaName,
  getIfis
} from 'lib/helpers/personasImport';


const objectId = mongoose.Types.ObjectId;

const proccessData = ({
  structure,
  organisation,
  personaService
}) => async (row) => {
  const personaName = getPersonaName({
    structure,
    row
  });

  const ifis = getIfis({
    structure,
    row
  });

  if (ifis.length === 0) {
    // Do nothing, no ifi's to match.
  }

  const personaIdentifers = await map(
    ifis,
    ifi => personaService.createUpdateIdentifierPersona({
      organisation,
      personaName,
      ifi
    })
  );

  const personaIds = await map(personaIdentifers, ({ personaId }) => personaId);
  const toPersonaId = head(personaIds);
  const fromPersonaIds = tail(personaIds);

  await map(fromPersonaIds, (fromPersonaId) => {
    personaService.merge({
      organisation,
      toPersonaId,
      fromPersonaId
    });
  });
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
