import {
  findIndex,
  map,
  isUndefined,
  find,
  isArray,
  first as loFirst,
  last as loLast,
  get
} from 'lodash';
import {
  modelToCursor,
  getParsedScopedFilter,
  paginationToFilter,
} from 'lib/models/plugins/addCRUDFunctions';
import {
  MAX_TIME_MS,
  MAX_SCAN,
  BACKWARDS,
  FORWARDS
} from 'lib/constants/addCRUDFunctions';
import mongoose from 'mongoose';

// TODO: removal of old cursors.
/*
// TODO: (hard) insertion of new documents in correct place
We might not need to do this, as new records apear at top in ui currently.
*/
export const receiveChange = ({ // exported for testing
  schema,
  cursorHistory,
  ws,
  sort,
  before,
  after,
  direction = FORWARDS,
  pageInfo = {},
  filter,
}) => (changes) => {
  if (!isArray(changes)) {
    changes = [changes];
  }

  let cursor;

  if (before || after) {
    cursor = {};
  }

  // CREATE EDGES
  const edges = map(changes, (change) => {
    const newCursor = modelToCursor(change, sort);

    return {
      node: change,
      cursor: newCursor
    };
  });

  // SO NEW

  // CREATE CURSOR
  const existingIndex = findIndex(cursorHistory, (cursorHist) => {
    if (get(loFirst(edges), 'cursor') === cursorHist) {
      return true;
    }
    return false;
  });
  if (existingIndex >= 0) {
    cursor = {
      ...(existingIndex > 0) ? { after: cursorHistory[existingIndex - 1] } : {},
      ...(existingIndex < cursorHistory.length - 1) ?
        { before: cursorHistory[existingIndex + 1] } : {}
    };
  } else if (direction === FORWARDS) {
    cursor = {
      after: loLast(cursorHistory)
    };
  } else if (direction === BACKWARDS) {
    cursor = {
      before: loFirst(cursorHistory)
    };
  }

  // PUSH TO CURSOR HISTORY
  map(edges, (edge) => {
    const index = findIndex(cursorHistory, cur => cur === edge.cursor);
    if (index < 0) { // not found
      if (direction === FORWARDS) {
        cursorHistory.push(edge.cursor);
      } else if (direction === BACKWARDS) {
        cursorHistory.unshift(edge.cursor);
      }
    }
  });

  // EO NEW

  const out = {
    type: 'changed',
    schema,
    edges,
    pageInfo: {
      ...pageInfo,
      insertCursor: cursor,
      // hasNextPage: false,
      // This is commented as it will cause fetchModelsDiff to remove the back edges.
      // This is expected behaivour, if there are no previous pages.
      // hasPreviousPage: false,
      startCursor: get(loFirst(edges), 'cursor'),
      endCursor: get(loLast(edges), 'cursor')
    },
    filter,
    sort
  };

  ws.send(JSON.stringify(out));
};

async function getConnectionWsWatch({
  filter = {},
  authInfo,
  project,
  sort,
  beforeInclusive,
  afterInclusive,
  inclusive = true, // should allways be called here with true
  last,

  // modelName,
  // watch
}) {
  const actionName = 'view';

  if (!beforeInclusive && !afterInclusive) {
    throw new Error('beforeInclusive or afterInclusive must be defined');
  }

  if (inclusive !== true && !isUndefined(beforeInclusive) && !isUndefined(afterInclusive)) {
    throw new Error('inclusive should be true');
  }

  const parsedScopeFilter = await getParsedScopedFilter({
    authInfo,
    filter,
    modelName: this.modelName,
    actionName
  });

  const paginationFilter = [];
  if (beforeInclusive && last === Number.MAX_SAFE_INTEGER) {
    paginationFilter.push(paginationToFilter({
      cursor: beforeInclusive,
      inclusive: true,
      sort,
      paginationDirection: BACKWARDS
    }));
  }

  const castedPaginationFilter = map(paginationFilter, (filte) => {
    const out = mongoose.Query.prototype.cast(this, filte);
    return out;
  });

  const pipeline = this.aggregate()
    .match({
      operationType: {
        $ne: 'delete',
      }
    }) // TODO: handle delete
    .replaceRoot('fullDocument')
    .match({ $and: [parsedScopeFilter, ...castedPaginationFilter] });

  if (project) {
    pipeline.project(project);
  }

  const changeStream = this.watch(pipeline.pipeline(), {
    fullDocument: 'updateLookup' // return full document on everything
  });

  return changeStream;
}

async function getConnectionWs({
  filter = {},
  authInfo,
  ws,
  project,
  sort = { _id: 1 },
  after,
  before,
  afterInclusive,
  beforeInclusive,

  first = 10,
  last,

  hint,
  maxTimeMS = MAX_TIME_MS,
  maxScan = MAX_SCAN
}) {
  const changedDocuments = [];

  /*
    Watch doesn't support limits, so only setup watch if no limits, or both
    before and after cursors are set.
  */
  const canDoWatch = ((beforeInclusive && afterInclusive) ||
    (after && first === Number.MAX_SAFE_INTEGER) ||
    (before && last === Number.MAX_SAFE_INTEGER)
  );

  let changeStream;
  if (canDoWatch) {
    changeStream = await this.getConnectionWsWatch({
      filter,
      authInfo,
      ws,
      project,
      sort,
      beforeInclusive,
      afterInclusive,
      first,
      last,

      // modelName: this.modelName,
      // watch: this.watch
    });

    // watches all cursors
    changeStream.on('change', (node) => {
      const cursor = modelToCursor(node);

      changedDocuments.push({
        cursor,
        node
      });
    });
  }

  // ========================
  const out = await this.getConnection({
    first,
    last,
    after: afterInclusive || after,
    before: beforeInclusive || before,
    inclusive: !!(beforeInclusive || afterInclusive),
    sort,
    filter,
    authInfo,
    hint,
    project,
    maxTimeMS,
    maxScan
  });

  const history = map(out.edges, edge => edge.cursor);

  // stream changes, called once, second time
  if (changeStream) {
    changeStream.on('change', receiveChange({
      schema: this.modelName,
      cursorHistory: history,
      ws,
      sort,
      direction: BACKWARDS,
      filter
    }));
  }

  out.edges = map(out.edges, ({ cursor, node }) => {
    const replacementEdge = find(
      changedDocuments,
      ({ cursor: wsCursor }) => wsCursor === cursor
    );
    if (replacementEdge) {
      return replacementEdge;
    }
    return {
      cursor,
      node
    };
  });

  // First fetch
  receiveChange({
    schema: this.modelName,
    after,
    before,
    cursorHistory: [],
    ws,
    sort,
    pageInfo: get(out, 'pageInfo'),
    filter
  })(map(out.edges, ou => ou.node));

  // if live updates are enabled
  if (!canDoWatch) {
    // setup the websocket
    // recurse
    const newChangeStream = await this.getConnectionWs({
      filter,
      authInfo,
      ws,
      project,
      sort,

      // after: out.pageInfo.startCursor,
      after,
      before,
      beforeInclusive: out.pageInfo.endCursor,
      afterInclusive: out.pageInfo.startCursor,
      first,
      last: (!after) ? Number.MAX_SAFE_INTEGER : last,

      hint,
      maxTimeMS,
      maxScan
    });

    // shut down old listeners
    if (changeStream) {
      changeStream.driverChangeStream.close();
      changeStream.removeAllListeners();
      changeStream.close();
    }

    return newChangeStream;
  }

  return changeStream;
}

export default function addWSFunctions(schema) {
  schema.statics.getConnectionWsWatch = getConnectionWsWatch;
  schema.statics.getConnectionWs = getConnectionWs;
}
