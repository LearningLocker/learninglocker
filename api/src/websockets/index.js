import {
  getCookieName,
  getCookieNameStartsWith
} from 'ui/utils/auth';
import { verifyToken } from 'api/auth/passport';
import aggregationProcessor from './aggregationProcessor';

const messageManager = ws => async (message) => {
  const jsonMessage = JSON.parse(message);
  switch (jsonMessage.type) {
    case 'AGGREGATION_PROCESSOR_REGISTER': {
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
      } catch (err) {
        ws.close();
        break;
      }

      aggregationProcessor({
        ws,
        authInfo,
        aggregationProcessorId: jsonMessage.aggregationProcessorId
      });

      break;
    }
    default:
      ws.close();
      break;
  }

};

const add = (ws) => {
  const state = {};
  ws.on('message', messageManager(ws, state));
};

export default {
  add
};
