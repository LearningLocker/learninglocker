import { getCookieName } from 'ui/utils/auth';
import { verifyToken } from 'api/auth/passport';
import Statement from 'lib/models/statement';

const websockets = [];

const messageManager = ws => async (message) => {
  const jsonMessage = JSON.parse(message);

  switch (jsonMessage.type) {
    case 'authenticate': {
      // TODO:
      const organisationId = '59c209c4ad95fd50960c0362';
      const cookieName = getCookieName({ tokenType: 'organisation', tokenId: organisationId });

      const token = jsonMessage.value[cookieName];
      let authDetails;
      try {
        authDetails = await verifyToken(token);
      } catch (err) {
        ws.close();
      }


      websockets.push({
        organisationId,
        authDetails,
        ws
      });
      break;
    }
    case 'REGISTER': {
      const cookieName = getCookieName({
        tokenType: 'organisation', tokenId: jsonMessage.organisationId
      });

      if (jsonMessage.schema !== 'statement') {
        // ONLY suport statement live updates atm.
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

      Statement.getConnectionWs({
        filter: jsonMessage.filter,
        cursor: jsonMessage.cursor,
        authInfo,
        ws
      });
      // watch the websocket, and push new stuff down to it

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
