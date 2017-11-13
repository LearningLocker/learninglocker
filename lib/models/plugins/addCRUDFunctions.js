import _, { map, isArray } from 'lodash';
import mongoose from 'mongoose';
import { getConnection as getDBConnection } from 'lib/connections/mongoose';
import parseQuery from 'lib/helpers/parseQuery';
import { fromCursor, toCursor } from 'lib/helpers/cursor';
import getOrgFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getOrgFromAuthInfo';
import getScopeFilter from 'lib/services/auth/filters/getScopeFilter';
import getScopeSelect from 'lib/services/auth/selects/getScopeSelect';

const objectId = mongoose.Types.ObjectId;

const BACKWARDS = 'backwards';
const FORWARDS = 'forwards';

const MAX_TIME_MS = process.env.MAX_TIME_MS
  ? Number(process.env.MAX_TIME_MS)
  : 0;
const MAX_SCAN = process.env.MAX_SCAN ? Number(process.env.MAX_SCAN) : 0;

const sortDirectionToOperator = (direction, paginationDirection) => {
  if (paginationDirection === FORWARDS) {
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
  } else if (paginationDirection === BACKWARDS) {
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


const getLrsFilter = ({
  authInfo,
  modelName
}) => {
  if (!getDBConnection().model(modelName).schema.paths.lrs_id) {
    return;
  }
  if (
    authInfo.client && authInfo.client.lrs_id
  ) {
    return {
      lrs_id: objectId(authInfo.client.lrs_id)
    };
  }
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
  const lrsFilter = getLrsFilter({
    authInfo,
    modelName,
  });

  const filters = [parsedFilter, scopedFilter, lrsFilter]
    .filter(item => !_.isUndefined(item) && !_.isEmpty(item));

  const parsedScopeFilter = filters.length <= 1
    ? _.first(filters)
    : { $and: filters };
  return parsedScopeFilter;
};

const getHasNextPages = ({
  models,
  limit,
  direction,
  cursor
}) => {
  const ifGoingBackwardsAndHasCursor = (direction === BACKWARDS && cursor !== undefined);
  const ifGoingForwardAndHasMoreModels = direction === FORWARDS && models.length > limit;

  return (ifGoingBackwardsAndHasCursor || ifGoingForwardAndHasMoreModels);
};

const getHasPreviousPages = ({
  models,
  limit,
  direction,
  cursor
}) => {
  const ifGoingForwardsAndHasCursor = (direction === FORWARDS && cursor !== undefined);
  const ifGoingBackwardsAndHasMoreModels = direction === BACKWARDS && models.length > limit;

  return (ifGoingForwardsAndHasCursor || ifGoingBackwardsAndHasMoreModels);
};

export function postFetchMap(model) {
  if (!this.postFetchMap) {
    return model;
  }

  if (isArray(model)) {
    return map(model, this.postFetchMap);
  }

  return this.postFetchMap(model);
}

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
  const modelName = this.modelName;
  const actionName = 'view';

  const parsedScopeFilter = await getParsedScopedFilter({
    authInfo,
    filter,
    modelName,
    actionName,
  });

  const query = this.find(parsedScopeFilter, {}, { maxTimeMS, maxScan });

  // apply sort
  query.sort(sort);

  if (hint) query.hint(hint);

  const direction = (before) ? BACKWARDS : FORWARDS;

  // apply cursors
  if (after) {
    const cursorFilter = paginationToFilter({
      cursor: after,
      sort,
      paginationDirection: direction
    });
    query.where(cursorFilter);
  } else if (before) {
    const cursorFilter = paginationToFilter({
      cursor: after,
      sort,
      paginationDirection: direction
    });
    query.where(cursorFilter);
  }

  // apply limit
  const limit = first || last || 100;
  query.limit(limit + 1);


  const scopeSelect = await getScopeSelect({
    modelName,
    actionName,
    authInfo,
  });

  let finalProjection;
  if (project) {
    if (scopeSelect) {
      const scopeSelectKeys = _.keys(scopeSelect);
      const projectKeys = _.keys(project);

      const keysIntersect = _.intersection(scopeSelectKeys, projectKeys);
      finalProjection = keysIntersect.reduce((result, key) => {
        result[key] = project[key];
        return result;
      }, {});
    } else {
      finalProjection = project;
    }
  } else {
    finalProjection = scopeSelect;
  }

  if (finalProjection) {
    query.select(finalProjection);
  }

  const models = await query.exec();
  const modelsToReturn = models.slice(0, limit);
  const modelsToReturnMap = postFetchMap.bind(this)(modelsToReturn);

  const startCursor = modelToCursor(_.first(modelsToReturnMap), sort);
  const endCursor = modelToCursor(_.last(modelsToReturnMap), sort);

  const cursor = after || before;


  const hasNextPage = getHasNextPages({
    models,
    limit,
    direction,
    cursor
  });

  const hasPreviousPage = getHasPreviousPages({
    models,
    limit,
    direction,
    cursor
  });

  const out = {
    edges: _.map(modelsToReturnMap, model => ({
      cursor: modelToCursor(model, sort),
      node: model
    })),
    pageInfo: {
      hasNextPage,
      hasPreviousPage,
      startCursor,
      endCursor,
    }
  };

  return out;
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

  const result = await this.findOneAndUpdate(parsedScopeFilter, nextProps, {
    new: true
  }).exec();

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
