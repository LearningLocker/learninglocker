import set from 'lodash/set';

export default (authInfo, organisationId) => {
  const nextAuthInto = set(authInfo, ['token', 'organisationId'], organisationId);
  return nextAuthInto;
};
