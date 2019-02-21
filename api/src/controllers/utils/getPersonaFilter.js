import mongoose from 'mongoose';
import isString from 'lodash/isString';

const objectId = mongoose.Types.ObjectId;

export default (personaVal, personaKey = 'persona') => {
  if (!personaVal) {
    return {};
  }

  if (isString(personaVal)) {
    return { [personaKey]: objectId(personaVal) };
  }

  return {
    [personaKey]: personaVal
  };
};
