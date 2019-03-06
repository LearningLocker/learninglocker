import {
  getCookieName,
  getCookieNameStartsWith
} from 'ui/utils/auth';
import { verifyToken } from 'api/auth/passport';
import Statement from 'lib/models/statement';
import User from 'lib/models/user';
import { isUndefined } from 'lodash';
import logger from 'lib/logger';

const getModel = (schema) => {
  switch (schema) {
    // only support statements currently
    case 'statement':
      return Statement;
    case 'user':
      return User;
    default:
      return;
  }
};

const messageManager = ws => async (message) => {
  const jsonMessage = JSON.parse(message);
  switch (jsonMessage.type) {
    case 'REGISTER': {
      let cookieName;

      if (jsonMessage.organisationId) {
        cookieName = getCookieName({
          tokenType: 'organisation',
          tokenId: jsonMessage.organisationId
        });
      } else {
        cookieName = getCookieNameStartsWith({
          tokenType: 'user'
        }, jsonMessage.auth);
      }

      const model = getModel(jsonMessage.schema);
      if (isUndefined(model)) {
        break;
      }

      const token = jsonMessage.auth[cookieName];
      let authInfo;
      try {
        authInfo = (await verifyToken(token)).authInfo;
      } catch (err) {
        ws.close();
        break;
      }

      const changeStream = await model.getConnectionWs({
        filter: jsonMessage.filter,
        ...jsonMessage.cursor,
        authInfo,
        sort: jsonMessage.sort,
        ws
      });

      ws.on('error', (err) => {
        logger.error('websocket error', err);

        if (changeStream) {
          changeStream.driverChangeStream.close();
          changeStream.removeAllListeners();
        }
      });
      ws.on('close', () => {
        if (changeStream) {
          changeStream.driverChangeStream.close();
          changeStream.removeAllListeners();
        }
      });

      break;
    }
    default:
      break;
  }
};

const add = (ws) => {
  ws.on('message', messageManager(ws));
};

export default {
  add
};
