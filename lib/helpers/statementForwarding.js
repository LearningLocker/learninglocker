import { fromJS } from 'immutable';
import { AUTH_TYPE_TOKEN, AUTH_TYPE_BASIC_AUTH } from 'lib/constants/statementForwarding';

export const getAuthHeaders = ({ // eslint-disable-line import/prefer-default-export
  configuration
}) => {
  if (configuration.authType === AUTH_TYPE_TOKEN) {
    return fromJS({
      Authorization: `Bearer ${configuration.secret}`
    });
  } else if (configuration.authType === AUTH_TYPE_BASIC_AUTH) {
    const basicAuth1 =
      `${configuration.basicUsername}:${configuration.basicPassword}`;
    const basicAuth2 = new Buffer(basicAuth1).toString('base64');

    return fromJS({
      Authorization: `Basic ${basicAuth2}`
    });
  }
  return fromJS({});
};
