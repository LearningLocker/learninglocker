import { getCookieName } from 'ui/utils/auth';
import { verifyToken } from 'api/auth/passport';
import Statement from 'lib/models/statement';

const messageManager = ws => async (message) => {
  const jsonMessage = JSON.parse(message);

  switch (jsonMessage.type) {
    case 'REGISTER': {
      const cookieName = getCookieName({
        tokenType: 'organisation', tokenId: jsonMessage.organisationId
      });

      if (jsonMessage.schema !== 'statement') {
        // Only suport statement live updates atm.
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

      const changeStream = await Statement.getConnectionWs({
        filter: jsonMessage.filter,
        cursor: jsonMessage.cursor,
        authInfo,
        sort: jsonMessage.sort,
        ws
      });

      ws.on('error', () => {
        changeStream.driverChangeStream.close();
        changeStream.removeAllListeners();
      });
      ws.on('close', () => {
        changeStream.driverChangeStream.close();
        changeStream.removeAllListeners();
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
