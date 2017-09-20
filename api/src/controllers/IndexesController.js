import { jsonSuccess, serverError } from 'api/utils/responses';

export default model => (req, res) => {
  model.getIndexes().then(indexes =>
    indexes.map(({ key, name }) => ({ key, name }))
  ).then(jsonSuccess(res)).catch(serverError(res));
};
