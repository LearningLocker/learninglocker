import getOrgFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getOrgFromAuthInfo';

export default function createFromRecord({ authInfo, record }) {
  const organisation = getOrgFromAuthInfo(authInfo);
  return this.create({ ...record, organisation });
}
