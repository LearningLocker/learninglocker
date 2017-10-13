import includes from 'lodash/includes';
import get from 'lodash/get';
// import chain from 'lodash/chain';
import { chain } from 'lodash';
import map from 'lodash/map';
import intersection from 'lodash/intersection';
import {
  SITE_ADMIN,
  ALL,
  MANAGE_ALL_ORGANISATIONS
} from 'lib/constants/scopes';
import getScopesFromAuthInfo from 'lib/services/auth/authInfoSelectors/getScopesFromAuthInfo';
import NoAccessError from 'lib/errors/NoAccessError';
import Role from 'lib/models/role';

const getUserViewableOrgsFilter = async (authInfo) => {
  let organisationIds = [];
  if (get(authInfo, ['token', 'tokenType']) === 'client') {
    organisationIds = [get(authInfo, 'organisation')];
  } else if (
    get(authInfo, ['token', 'tokenType']) === 'organisation' ||
    get(authInfo, ['token', 'tokenType']) === 'user'
  ) {
    organisationIds = get(authInfo, ['user', 'organisations'], []);
  }
  const filter = { _id: { $in: organisationIds } };
  return filter;
};

const getUserEditableOrgsFilter = async (
  authInfo,
  validOrganisationTokenScopes = [ALL]
) => {
  let organisationIds = [];
  if (get(authInfo, ['token', 'tokenType']) === 'client') {
    const scopes = get(authInfo, ['scopes'], []);
    if (includes(scopes, ALL)) {
      organisationIds = [get(authInfo, 'organisation')];
    }
  } else if (get(authInfo, ['token', 'tokenType']) === 'organisation') {
    const usersRoles = chain(get(authInfo, ['user', 'organisationSettings'], []))
      .map(({ roles }) => roles)
      .flatten()
      .value();

    const roles = await Role.find({
      _id: {
        $in: usersRoles
      },
      scopes: {
        $in: validOrganisationTokenScopes
      }
    }).select({
      organisation: 1
    }).lean();

    organisationIds = map(roles, ({ organisation }) => organisation);
  }

  const filter = { _id: { $in: organisationIds } };
  return filter;
};

export default async ({ actionName, authInfo }) => {
  const scopes = getScopesFromAuthInfo(authInfo);

  if (includes(scopes, SITE_ADMIN)) {
    return {};
  }
  // Owner of organisation shouldn't nessacerly have this priv - James
  // if (await isOrgOwnerInAuthInfo(authInfo)) {
  //   return getUserOrgsFilter(authInfo);
  // }

  switch (actionName) {
    case 'view': {
      const filter = getUserViewableOrgsFilter(authInfo);
      return filter;
    }
    case 'create': {
      const allowedCreateScopes = [ALL, MANAGE_ALL_ORGANISATIONS];
      if (
        intersection(scopes, allowedCreateScopes).length === 0
      ) {
        throw new NoAccessError();
      }
      break;
    }
    case 'delete':
    case 'edit': {
      // Don't understand how this works, getOrgFilter only returns the organisation associated to current auth info
      // if (includes(scopes, MANAGE_ALL_ORGANISATIONS)) return getOrgFilter(authInfo);

      return await getUserEditableOrgsFilter(authInfo);
      // throw new NoAccessError();
    }
    default: {
      throw new NoAccessError();
    }
  }
};
