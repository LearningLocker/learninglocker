import {
  findIndex,
  last as loLast,
  map,
  isUndefined,
  find,
  isArray
} from 'lodash';
import {
  modelToCursor,
  getParsedScopedFilter,
  MAX_TIME_MS,
  MAX_SCAN,
  paginationToFilter,
  BACKWARDS,
  FORWARDS
} from 'lib/models/plugins/addCRUDFunctions';
import mongoose from 'mongoose';

// TODO: put new cursors in the correct position.
// TODO: removal of old cursors.
// TODO: cursor direction.
const receiveChange = ({
  schema,
  cursorHistory,
  ws,
  sort,
  before,
  after
}) => (changes) => {
  if (!isArray(changes)) {
    changes = [changes];
  }
  const oldCursor = loLast(cursorHistory);

  // TODO: Before, after

  const edges = map(changes, (change) => {
    const newCursor = modelToCursor(change, sort);

    const index = findIndex(cursorHistory, cur => cur === newCursor);
    if (index < 0) {
      cursorHistory.push(newCursor);
    }

    return {
      node: change,
      cursor: newCursor
    };
  });

  ws.send(JSON.stringify({
    type: 'changed',
    schema,
    edges,
    before: oldCursor || before,
    after
  }));
};

async function getConnectionWsWatch({
  filter = {},
  authInfo,
  project,
  sort,
  before,
  after,
  inclusive = true, // should allways be called here with true
  last,

  // modelName,
  // watch
}) {
  const actionName = 'view';

  if (!before && !after) {
    throw new Error('before or after must be defined');
  }

  if (inclusive !== true && !isUndefined(before) && !isUndefined(after)) {
    throw new Error('inclusive should be true');
  }

  const parsedScopeFilter = await getParsedScopedFilter({
    authInfo,
    filter,
    modelName: this.modelName,
    actionName
  });

  const paginationFilter = [];
  if (before && last === Number.MAX_SAFE_INTEGER) {
    paginationFilter.push(paginationToFilter({
      cursor: before,
      inclusive,
      sort,
      paginationDirection: BACKWARDS
    }));
  }

  // if (after) {
  //   paginationFilter.push(paginationToFilter({
  //     cursor: after,
  //     inclusive,
  //     sort,
  //     paginationDirection: FORWARDS
  //   }));
  // }

  const castedPaginationFilter = map(paginationFilter, filte =>
    mongoose.Query.prototype.cast(this, filte)
  );

  const pipeline = this.aggregate(parsedScopeFilter)
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
  inclusive = false,

  first = 10,
  last,

  hint,
  maxTimeMS = MAX_TIME_MS,
  maxScan = MAX_SCAN

}) {
  const changedDocuments = [];

  let changeStream;
  if (before || after) {
    changeStream = await this.getConnectionWsWatch({
      filter,
      authInfo,
      ws,
      project,
      sort,
      before,
      after,
      first,
      last,
      inclusive,
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
    after,
    before,
    inclusive,
    sort,
    filter,
    authInfo,
    hint,
    project,
    maxTimeMS,
    maxScan
  });

  const history = map(out.edges, edge => edge.cursor);

  // stream changes
  if (changeStream) {
    changeStream.on('change', receiveChange({
      schema: this.modelName,
      cursorHistory: history,
      ws,
      sort
    }));
  }

  out.edges = map(out.edges, ({ cursor, node }) => {
    const replacementEdge = find(changedDocuments, ({ cursor: wsCursor }) => wsCursor === cursor);
    if (replacementEdge) {
      return replacementEdge;
    }
    return {
      cursor,
      node
    };
  });

  receiveChange({
    schema: this.modelName,
    cursorHistory: [],
    ws,
    sort
  })(map(out.edges, ou => ou.node));

  // if live updates are enabled
  if (isUndefined(before) && isUndefined(after)) {
    // setup the websocket
    // recurse
    await this.getConnectionWs({
      filter,
      authInfo,
      ws,
      project,
      sort,

      after: undefined,
      before: out.pageInfo.endCursor,
      inclusive: true,
      first: undefined,
      last: Number.MAX_SAFE_INTEGER,

      hint,
      maxTimeMS,
      maxScan
    });

    // shut down old listeners
    if (changeStream) {
      changeStream.driverChangeStream.close();
      changeStream.removeAllListeners();
    }
  }

  return changeStream;
}

export default function addWSFunctions(schema) {
  schema.statics.getConnectionWsWatch = getConnectionWsWatch;
  schema.statics.getConnectionWs = getConnectionWs;
}
