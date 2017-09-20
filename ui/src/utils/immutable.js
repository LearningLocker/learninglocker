import { Iterable } from 'immutable';

const setReviver = (key, value) => {
  const isIndexed = Iterable.isIndexed(value);
  return isIndexed ? value.toSet() : value.toMap();
};

export {
  setReviver //eslint-disable-line
};
