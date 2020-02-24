import {
  getCookieName,
  getCookieNameStartsWith
} from 'ui/utils/auth';
import { verifyToken } from 'api/auth/passport';
import { AGGREGATION_PROCESSOR_REGISTER } from 'lib/constants/aggregationProcessor';
import aggregationProcessor from './aggregationProcessor';

/**
 * @param {module:ll.WS} ws
 * @returns {Promise<void>}
 */
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
        cookieName = getCookieNameStartsWith(
          {
            tokenType: 'user'
          },
          jsonMessage.auth
        );
      }

      const token = jsonMessage.auth[cookieName];

      try {
        const { authInfo } = await verifyToken(token);

        await aggregationProcessor({
          ws,
          authInfo,
          aggregationProcessorId: jsonMessage.aggregationProcessorId
        });
      } catch (err) {
        ws.close();
      }

      break;
    }
    default:
      ws.close();

      break;
  }
};

/** @param {module:ll.WS} websocket */
const addMessageHandler = (websocket) => {
  websocket.on('message', messageManager(websocket));
};

export {
  addMessageHandler
};
