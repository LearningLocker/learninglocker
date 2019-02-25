import _ from 'lodash';
import * as getConnection from 'lib/models/plugins/addCRUDFunctions/getConnection';
import getOrgFromAuthInfo from 'lib/services/auth/authInfoSelectors/getOrgFromAuthInfo';
import { getConnection as getDBConnection } from 'lib/connections/mongoose';
import getScopeSelect from 'lib/services/auth/selects/getScopeSelect';
import { MAX_TIME_MS, MAX_SCAN } from 'lib/constants/addCRUDFunctions';
import getParsedScopedFilter from './getParsedScopedFilter';
import postFetchMap from './postFetchMap';

const getLrsStatementCount = ({ orgFilter, maxTimeMS, maxScan, hint }) => {
  const LRS = getDBConnection().model('Lrs');
  const query = LRS.collection.find(orgFilter, {}, { maxTimeMS, maxScan });
  if (hint) query.hint(hint);
  return query
    .project({ statementCount: 1 })
    .toArray()
    .then(docs => docs.reduce((count, doc) => count + doc.statementCount, 0));
};

async function getCount({
  filter,
  authInfo,
  maxTimeMS = MAX_TIME_MS,
  maxScan = MAX_SCAN,
  hint
}) {
  const parsedScopeFilter = await getParsedScopedFilter({
    authInfo,
    filter,
    modelName: this.modelName,
    actionName: 'view'
  });
  const canUseLrsCount =
    this.modelName === 'Statement' &&
    _.isEmpty(filter) &&
    Object.keys(parsedScopeFilter).length === 1 &&
    _.includes(Object.keys(parsedScopeFilter), 'organisation');
  if (canUseLrsCount) {
    return getLrsStatementCount({
      orgFilter: parsedScopeFilter,
      maxTimeMS,
      maxScan,
      hint
    });
  }
  const query = this.find(parsedScopeFilter, {}, { maxTimeMS, maxScan });
  if (hint) query.hint(hint);
  return query.select({ _id: 0, organisation: 1 }).countDocuments();
}

async function getById({ _id, authInfo }) {
  const modelName = this.modelName;
  const actionName = 'view';

  const parsedScopeFilter = await getParsedScopedFilter({
    authInfo,
    filter: { _id },
    modelName,
    actionName,
  });
  const query = this.find(parsedScopeFilter)
    .limit(1);

  const scopeSelect = await getScopeSelect({
    modelName,
    actionName,
    authInfo,
  });
  if (scopeSelect) {
    query.select(scopeSelect);
  }

  return query
    .exec()
    .then(models =>
      postFetchMap.bind(this)(_.first(models))
    );
}

async function updateById({ _id, authInfo, record }) {
  const parsedScopeFilter = await getParsedScopedFilter({
    authInfo,
    filter: { _id },
    modelName: this.modelName,
    actionName: 'edit'
  });
  const organisation = getOrgFromAuthInfo(authInfo, { _id });
  const nextProps = { ...record, organisation };

  await this.updateOne(parsedScopeFilter, nextProps);
  const result = await this.findOne(parsedScopeFilter);

  return postFetchMap.bind(this)(result);
}

function createFromRecord({ authInfo, record }) {
  const organisation = getOrgFromAuthInfo(authInfo);
  return this.create({ ...record, organisation });
}

async function deleteById({ authInfo, _id }) {
  const parsedScopeFilter = await getParsedScopedFilter({
    authInfo,
    filter: { _id },
    modelName: this.modelName,
    actionName: 'delete'
  });
  return this.deleteOne(parsedScopeFilter).then(() => _id);
}

function getIndexes() {
  return this.collection.indexes();
}

console.log('001', getConnection);

export default function addCRUDFunctions(schema) {
  console.log('002');

  schema.statics.getConnection = getConnection;
  schema.statics.getCount = getCount;
  schema.statics.getById = getById;
  schema.statics.getIndexes = getIndexes;

  schema.statics.updateById = updateById;
  schema.statics.createFromRecord = createFromRecord;
  schema.statics.deleteById = deleteById;
};

// export default addCRUDFunctions;

export { postFetchMap, MAX_TIME_MS, MAX_SCAN };
