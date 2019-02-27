import { MAX_TIME_MS, MAX_SCAN } from 'lib/constants/addCRUDFunctions';
import getIndexes from './getIndexes';
import deleteById from './deleteById';
import getParsedScopedFilter from './getParsedScopedFilter';
import createFromRecord from './createFromRecord';
import updateById from './updateById';
import postFetchMap from './postFetchMap';
import getById from './getById';
import getCount from './getCount';
import getConnection from './getConnection';
import paginationToFilter from './paginationToFilter';
import modelToCursor from './modelToCursor';

export default function addCRUDFunctions(schema) {
  schema.statics.getConnection = getConnection;
  schema.statics.getCount = getCount;
  schema.statics.getById = getById;
  schema.statics.getIndexes = getIndexes;

  schema.statics.updateById = updateById;
  schema.statics.createFromRecord = createFromRecord;
  schema.statics.deleteById = deleteById;
}

export {
  getParsedScopedFilter,
  postFetchMap,
  paginationToFilter,
  modelToCursor,
  MAX_TIME_MS,
  MAX_SCAN
};
