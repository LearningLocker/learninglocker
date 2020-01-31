import get from 'lodash/get';

export default authInfo =>
  get(authInfo, ['client', 'lrs_id'], {});

