import * as fileService from 'lib/services/files';
import csv from 'fast-csv';
import { isUndefined, uniq } from 'lodash';
import EmptyCsvError from 'lib/errors/EmptyCsvError';
import DuplicateCsvHeadersError from 'lib/errors/DuplicateCsvHeadersError';

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

  const headersMissing = isUndefined(headers) || headers.length === 0;
  if (headersMissing) {
    throw new EmptyCsvError('The CSV cannot be empty.');
  }

  const hasDuplicateHeaders = uniq(headers).length !== headers.length;
  if (hasDuplicateHeaders) {
    throw new DuplicateCsvHeadersError('The CSV cannot contain duplicate headings.');
  }

  return headers;
};

export default getCsvHeaders;
