import { keys, pick } from 'lodash';
import { toCursor } from 'lib/helpers/cursor';

const modelToCursor = (model, sort) => {
  const data = pick(model, keys(sort));
  const cursor = toCursor(data);
  return cursor;
};

export default modelToCursor;
