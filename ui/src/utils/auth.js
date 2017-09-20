import { COOKIE_ACCESS_TOKEN } from 'lib/constants/cookies';
import { startsWith, endsWith, includes, findKey } from 'lodash';

/**
 * Returns the string identifier used to find a cookie
 * @param {string} tokenId - optional parameter
 */
const getCookieName = ({ tokenType, tokenId }) =>
  `${COOKIE_ACCESS_TOKEN}_${tokenType}${tokenId ? `_${tokenId}` : ''}`;

const getCookieNameStartsWith = ({ tokenType }, cookies) => {
  const key = findKey(cookies, (item, key2) =>
    key2.startsWith(`${COOKIE_ACCESS_TOKEN}_${tokenType}_`)
  );

  return key;
};

/**
 * Tests whether the given cookie name is any auth cookie
 */
const testCookieName = cookieName => startsWith(cookieName, COOKIE_ACCESS_TOKEN);

/**
 * Returns a function that tests whether the given cookie name is an org auth cookie
 * @param {*} organisationId - optional param
 */
const testOrgCookieName = organisationId => (cookieName) => {
  const isUserCookie = startsWith(cookieName, COOKIE_ACCESS_TOKEN) && endsWith(cookieName, 'user');
  const isOrgCookie = includes(cookieName, 'organisation');
  const isForOrg = organisationId ? endsWith(cookieName, organisationId) : true;
  return !isUserCookie && isOrgCookie && isForOrg;
};

export {
  getCookieName,
  getCookieNameStartsWith,
  testCookieName,
  testOrgCookieName
};
