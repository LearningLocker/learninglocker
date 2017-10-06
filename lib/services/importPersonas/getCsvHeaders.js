import * as fileService from 'lib/services/files';
import csv from 'fast-csv';
import { isUndefined } from 'lodash';
import EmptyCsvError from 'lib/errors/EmptyCsvError';

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

  if (isUndefined(headers) || headers.length === 0) {
    throw new EmptyCsvError();
  }

  return headers;
};

export default getCsvHeaders;
