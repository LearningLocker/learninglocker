import { get, isString } from 'lodash';

export default (ifi) => {
  const key = get(ifi, 'key');
  const value = get(ifi, 'value');
  if (key === 'mbox' && isString(value) && value.slice(0, 7) !== 'mailto:') {
    return { key: 'mbox', value: `mailto:${value}` };
  }
  return ifi;
};
