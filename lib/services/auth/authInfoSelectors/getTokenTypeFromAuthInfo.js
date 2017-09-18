import get from 'lodash/get';

export default authInfo => get(authInfo, ['token', 'tokenType']);
