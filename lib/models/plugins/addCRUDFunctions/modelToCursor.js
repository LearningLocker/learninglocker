import _ from 'lodash';
import { toCursor } from 'lib/helpers/cursor';

const modelToCursor = (model, sort) => {
  const data = _.pick(model, _.keys(sort));
  const cursor = toCursor(data);
  return cursor;
};

export default modelToCursor;
