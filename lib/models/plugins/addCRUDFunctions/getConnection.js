import {
  FORWARDS,
  BACKWARDS,
  MAX_TIME_MS,
  MAX_SCAN
} from 'lib/constants/addCRUDFunctions';
import getScopeSelect from 'lib/services/auth/selects/getScopeSelect';
import _ from 'lodash';
import modelToCursor from './modelToCursor';
import getParsedScopedFilter from './getParsedScopedFilter';
import paginationToFilter from './paginationToFilter';
import postFetchMap from './postFetchMap';


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

export default async function getConnection({
  first = 10,
  last,
  after,
  before,
  inclusive,
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
      inclusive,
      sort,
      paginationDirection: direction
    });
    query.where(cursorFilter);
  } else if (before) {
    const cursorFilter = paginationToFilter({
      cursor: after,
      inclusive,
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
