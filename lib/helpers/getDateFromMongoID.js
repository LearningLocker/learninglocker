import isString from 'lodash/isString';

export default (_id) => {
  if (!isString(_id) || _id.length !== 24) {
    // not a mongo id
    throw Error('Not a Mongo ID');
  }
  const timehex = _id.substring(0, 8);

  // convert to a number... base 16
  const secondsSinceEpoch = parseInt(timehex, 16);
  if (isNaN(secondsSinceEpoch)) {
    throw Error('Invalid date in Mongo ID');
  }

  // convert to milliseconds, and create a new date
  return new Date(secondsSinceEpoch * 1000);
};
