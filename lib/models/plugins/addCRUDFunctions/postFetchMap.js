import { isArray, map } from 'lodash';

export default function postFetchMap(model) {
  if (!this.postFetchMap) {
    return model;
  }

  if (isArray(model)) {
    return map(model, this.postFetchMap);
  }

  return this.postFetchMap(model);
}
