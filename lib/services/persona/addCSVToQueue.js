import { csvDataHandler } from 'lib/services/persona';
import ImportCsv from 'lib/models/importcsv';

export default (fileStream, org, userId, done) => {
  const newImport = new ImportCsv({
    organisation: org,
    owner: userId
  });
  newImport.save((err, importModel) => {
    if (err) return done(err);
    const importModelId = importModel._id;

    csvDataHandler({ fileStream, org, importModelId }, (err) => {
      if (err) return done(err);
      return done(null, importModelId);
    });
  });
};
