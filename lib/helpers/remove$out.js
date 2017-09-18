import _ from 'lodash';

const shouldRemove = value => (_.isPlainObject(value) && _.has(value, '$out'));

const remove$out = (value) => {
  let nextValue = value;

  if (_.isArray(nextValue)) {
    nextValue = _.reject(nextValue, shouldRemove);

    return _.map(nextValue, remove$out);
  }
  if (_.isPlainObject(nextValue)) {
    Object
      .keys(nextValue)
      .filter(shouldRemove)
      .forEach((key) => {
        delete nextValue[key];
      });
    return _.mapValues(nextValue, remove$out);
  }

  return nextValue;
};

export default remove$out;
