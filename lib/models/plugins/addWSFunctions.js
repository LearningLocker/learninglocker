import { findIndex, last as loLast } from 'lodash';
import { modelToCursor, getParsedScopedFilter } from 'lib/models/plugins/addCRUDFunctions';

async function getConnectionWs({
  filter = {},
  authInfo,
  ws,
  project,
  sort = { _id: 1 },
  cursor
}) {
  const modelName = this.modelName;
  const actionName = 'view';

  const parsedScopeFilter = await getParsedScopedFilter({
    authInfo,
    filter,
    modelName,
    actionName
  });

  const pipeline = this.aggregate()
    .replaceRoot('fullDocument')
    .match(parsedScopeFilter);

  if (project) {
    pipeline.project({ fullDocument: project });
  }

  const cursorHistory = [cursor];

  const changeStream = this.watch(pipeline.pipeline(), {
    fullDocument: 'updateLookup'
  });

  changeStream.on('change', (change) => {
    const newCursor = modelToCursor(change, sort);
    let oldCursor = loLast(cursorHistory);

    const index = findIndex(cursorHistory, cur => cur === newCursor);
    if (index > 0) {
      oldCursor = cursorHistory[index - 1];
    } else {
      cursorHistory.push(newCursor);
    }

    ws.send(JSON.stringify({
      type: 'changed',
      schema: this.modelName,
      node: change,
      cursor: newCursor,
      before: oldCursor
    }));
  });

  return changeStream;
}

export default function addWSFunctions(schema) {
  schema.statics.getConnectionWs = getConnectionWs;
}
