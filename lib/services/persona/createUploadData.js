import ImportData from 'lib/models/importdata';
import { addPersonasToQueue, getUploadData } from 'lib/services/persona';

export default (importId, data, done) => {
  Promise.all(data.map((d) => {
    const newImportData = new ImportData({
      importModel: importId,
      data: d,
    });
    return newImportData.save();
  })).then(() => {
    const dataStream = getUploadData(importId);
    addPersonasToQueue({ importId, dataStream }, done);
  }, (err) => {
    done(err);
  });
};
