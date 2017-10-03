import _ from 'lodash';
import { getConnection as getDBConnection } from 'lib/connections/mongoose';
import parseQuery from 'lib/helpers/parseQuery';
import { fromCursor, toCursor } from 'lib/helpers/cursor';
import getOrgFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getOrgFromAuthInfo';
import getScopeFilter from 'lib/services/auth/filters/getScopeFilter';

const MAX_TIME_MS = process.env.MAX_TIME_MS
  ? Number(process.env.MAX_TIME_MS)
  : 0;
const MAX_SCAN = process.env.MAX_SCAN ? Number(process.env.MAX_SCAN) : 0;

const sortDirectionToOperator = (direction, paginationDirection) => {
  if (paginationDirection === 'forwards') {
    switch (direction) {
      case 1:
      case 'asc':
        return '$gt';
      case -1:
      case 'desc':
        return '$lt';
      default:
        return null;
    }
  } else if (paginationDirection === 'backwards') {
    switch (direction) {
      case 1:
      case 'asc':
        return '$lt';
      case -1:
      case 'desc':
        return '$gt';
      default:
        return null;
    }
  }
  return null;
};

const paginationToFilter = ({ cursor, sort, paginationDirection }) => {
  const parsedCursor = fromCursor(cursor);
  const sortConditions = _.reduce(
    sort,
    ({ oldKeys, conditions }, direction, key) => {
      const operator = sortDirectionToOperator(direction, paginationDirection);
      // { _id: 1 } >>> { _id: { $gt: 'sampleid' } }
      const latestCondition = { [key]: { [operator]: parsedCursor[key] } };
      const oldConditions = _.zipObject(
        oldKeys,
        _.map(oldKeys, oldKey => parsedCursor[oldKey])
      );
      const finalCondition = { ...oldConditions, ...latestCondition };
      return {
        oldKeys: [...oldKeys, key],
        conditions: [...conditions, finalCondition]
      };
    },
    { oldKeys: [], conditions: [] }
  );
  return { $or: sortConditions.conditions };
};

const modelToCursor = (model, sort) => {
  const data = _.pick(model, _.keys(sort));
  const cursor = toCursor(data);
  return cursor;
};

const getLrsStatementCount = ({ orgFilter, maxTimeMS, maxScan, hint }) => {
  const LRS = getDBConnection().model('Lrs');
  const query = LRS.collection.find(orgFilter, {}, { maxTimeMS, maxScan });
  if (hint) query.hint(hint);
  return query
    .project({ statementCount: 1 })
    .toArray()
    .then(docs => docs.reduce((count, doc) => count + doc.statementCount, 0));
};

const getParsedScopedFilter = async ({
  authInfo,
  filter,
  modelName,
  actionName
}) => {
  const parsedFilter = await parseQuery(filter);
  const scopedFilter = await getScopeFilter({
    modelName,
    actionName,
    authInfo
  });
  const parsedScopeFilter = _.isEmpty(parsedFilter)
    ? scopedFilter
    : { $and: [parsedFilter, scopedFilter] };
  return parsedScopeFilter;
};

async function getConnection({
  first = 10,
  last,
  after,
  before,
  sort = { _id: 1 },
  filter = {},
  authInfo,
  hint,
  project,
  maxTimeMS = MAX_TIME_MS,
  maxScan = MAX_SCAN
}) {
  const parsedScopeFilter = await getParsedScopedFilter({
    authInfo,
    filter,
    modelName: this.modelName,
    actionName: 'view'
  });
  const query = this.find(parsedScopeFilter, {}, { maxTimeMS, maxScan });

  // apply sort
  query.sort(sort);

  if (hint) query.hint(hint);

  // apply cursors
  if (after) {
    const cursorFilter = paginationToFilter({
      cursor: after,
      sort,
      paginationDirection: 'forwards'
    });
    query.where(cursorFilter);
  } else if (before) {
    const cursorFilter = paginationToFilter({
      cursor: after,
      sort,
      paginationDirection: 'backwards'
    });
    query.where(cursorFilter);
  }

  // apply limit
  const limit = first || last || 100;
  query.limit(limit);

  if (project) query.select(project);

  return query.exec().then(models => ({
    edges: _.map(models, model => ({
      cursor: modelToCursor(model, sort),
      node: model
    })),
    pageInfo: {
      hasPreviousPage: true,
      hasNextPage: models.length >= limit,
      endCursor: modelToCursor(_.last(models), sort),
      startCursor: modelToCursor(_.first(models), sort)
    }
  }));
}

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
  return query.select({ _id: 0, organisation: 1 }).count();
}

async function getById({ _id, authInfo }) {
  const parsedScopeFilter = await getParsedScopedFilter({
    authInfo,
    filter: { _id },
    modelName: this.modelName,
    actionName: 'view'
  });
  return this.find(parsedScopeFilter)
    .limit(1)
    .exec()
    .then(models => _.first(models));
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

  return this.findOneAndUpdate(parsedScopeFilter, nextProps, {
    new: true
  }).exec();
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
  return this.remove(parsedScopeFilter).then(() => _id);
}

function getIndexes() {
  return this.collection.indexes();
}

export default function addCRUDFunctions(schema) {
  schema.statics.getConnection = getConnection;
  schema.statics.getCount = getCount;
  schema.statics.getById = getById;
  schema.statics.getIndexes = getIndexes;

  schema.statics.updateById = updateById;
  schema.statics.createFromRecord = createFromRecord;
  schema.statics.deleteById = deleteById;
}
