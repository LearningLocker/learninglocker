import _ from 'lodash';
import ImportCsv from 'lib/models/importcsv';
import { VALID_ROW_HEADERS } from 'lib/constants/uploads';
import csv from 'fast-csv';
import logger from 'lib/logger';
import { createUploadData } from 'lib/services/persona';

export default ({ fileStream, org, importModelId }, done) => {
  const output = [];
  const csvStream = csv({ ignoreEmpty: true })
    .on('data', (data) => {
      output.push(data);
    })
    .on('end', () => {
      logger.verbose('FINDING CSV INDEXES TO USE FOR MATCHING');
      const customIndexes = [];
      const matchedIndexes = {
        usernameIndex: -1,
        emailIndex: -1,
        firstnameIndex: -1,
        lastnameIndex: -1,
        openIdIndex: -1,
        nameIndex: -1,
        homePageIndex: -1
      };

      let hasMatch = false;

      const indexes = _.head(output);

      _.map(indexes, (value, index) => {
        let rowMatch = false;
        const rowHeader = value.toLowerCase();
        if (VALID_ROW_HEADERS.username.indexOf(rowHeader) >= 0) { matchedIndexes.usernameIndex = index; rowMatch = true; }
        if (VALID_ROW_HEADERS.email.indexOf(rowHeader) >= 0) { matchedIndexes.emailIndex = index; rowMatch = true; }
        if (VALID_ROW_HEADERS.firstname.indexOf(rowHeader) >= 0) { matchedIndexes.firstnameIndex = index; rowMatch = true; }
        if (VALID_ROW_HEADERS.lastname.indexOf(rowHeader) >= 0) { matchedIndexes.lastnameIndex = index; rowMatch = true; }
        if (VALID_ROW_HEADERS.openid.indexOf(rowHeader) >= 0) { matchedIndexes.openIdIndex = index; rowMatch = true; }
        if (VALID_ROW_HEADERS.name.indexOf(rowHeader) >= 0) { matchedIndexes.nameIndex = index; rowMatch = true; }
        if (VALID_ROW_HEADERS.homePage.indexOf(rowHeader) >= 0) { matchedIndexes.homePageIndex = index; rowMatch = true; }
        if (rowMatch) {
          hasMatch = true;
        } else {
          customIndexes.push({
            fieldName: rowHeader,
            index
          });
        }
      });

      if (hasMatch) {
        const people = _.slice(output, 1, output.length);
        ImportCsv.findByIdAndUpdate(importModelId, {
          $set: {
            matchedIndexes,
            customIndexes
          }
        }, (err) => {
          if (err) return done(err);
          logger.debug('MATCHED CSV INDEXES NOW SAVE DATA FOR PROCESSING WITH', importModelId);
          createUploadData(importModelId, people, done);
        });
      } else {
        done(new Error('Invalid CSV format.'));
      }
    });
  fileStream.pipe(csvStream);
};
