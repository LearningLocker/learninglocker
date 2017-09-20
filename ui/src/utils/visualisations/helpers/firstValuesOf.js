import { mapValues } from 'lodash';

export default keys =>
  mapValues(keys, (value, key) => ({ $first: `$${key}` }));
