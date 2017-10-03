import * as fileService from 'lib/services/files';
import getAuthFromRequest from 'lib/helpers/getAuthFromRequest';
import catchErrors from 'api/controllers/utils/catchErrors';
import getFileAndFieldsFromRequest from 'api/controllers/utils/getFileAndFieldsFromRequest';
import PersonasImport, { STAGE_CONFIGURE_FIELDS } from 'lib/models/personasImport';
import csv from 'fast-csv';
import { isUndefined } from 'lodash';

const getCsvHeaders = async (handle) => {
  const csvStream = csv.parse({
    headers: false,
    quoteHeaders: true
  });

  // read the first row.
  let headers;

  csvStream.on('data', (data) => {
    // we're just interested in the first one.
    if (isUndefined(headers)) headers = data;
  });

  const csvPromise = new Promise((resolve, reject) => {
    csvStream.on('error', reject);
    csvStream.on('finish', resolve);
  });

  fileService.downloadToStream(handle)(csvStream);

  await csvPromise;

  return headers;
};

const uploadPersonas = catchErrors(async (req, res) => {
  const authInfo = getAuthFromRequest(req);
  const { file, fields: { id } } = await getFileAndFieldsFromRequest(req);

  const handle = await fileService.uploadPersonas({
    authInfo,
    file,
    id
  });

  const csvHeaders = await getCsvHeaders(handle);

  const personasImport = await PersonasImport.findOneAndUpdate({
    _id: id
  }, {
    stage: STAGE_CONFIGURE_FIELDS,
    csvHandle: handle,
    csvHeaders,
  }, {
    new: true
  });

  return res.status(200).json(personasImport);
});

export default {
  uploadPersonas
};
