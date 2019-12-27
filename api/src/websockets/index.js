import {
  getCookieName,
  getCookieNameStartsWith
} from 'ui/utils/auth';
import { verifyToken } from 'api/auth/passport';
import Unauthorized from 'lib/errors/Unauthorised';
import { AGGREGATION_PROCESSOR_REGISTER } from 'lib/constants/aggregationProcessor';
import aggregationProcessor from './aggregationProcessor';

const messageManager = ws => async (message) => {
  const jsonMessage = JSON.parse(message);
  switch (jsonMessage.type) {
    case AGGREGATION_PROCESSOR_REGISTER: {
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
      const token = jsonMessage.auth[cookieName];
      let authInfo;
      try {
        authInfo = (await verifyToken(token)).authInfo;
        aggregationProcessor({
          ws,
          authInfo,
          aggregationProcessorId: jsonMessage.aggregationProcessorId
        });
      } catch (err) {
        if (err instanceof Unauthorized) {
          ws.close();
        }

        ws.close();
      }
      break;
    }
    default:
      ws.close();
      break;
  }
};

const add = (ws) => {
  ws.on('message', messageManager(ws));
};

export default {
  add
};
