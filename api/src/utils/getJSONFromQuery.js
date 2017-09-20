import getFromQuery from 'api/utils/getFromQuery';

export default (req, key, defaultValue) =>
  getFromQuery(req, key, defaultValue, JSON.parse.bind(JSON));
