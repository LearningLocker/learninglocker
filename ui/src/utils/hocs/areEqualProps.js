import { is, Iterable } from 'immutable';
import _ from 'lodash';

const areEqualProps = (o1, o2) => {
  const k1s = Object.keys(o1).filter(k => typeof o1[k] !== 'function');
  const k2s = Object.keys(o2).filter(k => typeof o2[k] !== 'function');
  const keys = [...new Set(k1s.concat(k2s))];
  return keys.every(k =>
    (Iterable.isIterable(o1[k]) ? is(o1[k], o2[k]) : _.isEqual(o1[k], o2[k]))
  );
};

export default areEqualProps;
