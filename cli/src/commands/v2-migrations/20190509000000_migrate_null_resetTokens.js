import logger from 'lib/logger';
import moment from 'moment';
import { getConnection } from 'lib/connections/mongoose';

const up = async () => {
  const connection = getConnection();
  logger.info('Updating all resetTokens with no expiry to have expiry from 24 hours from now.')
  const newExpiry = moment().add(1, 'day').toDate();
  await connection.collection('users').update({"resetTokens.expires": null}, {$set: {"resetTokens.$.expires": newExpiry }});
};

const down = async () => {
  logger.info('No down action  for resetToken migration');
};

export default { up, down };
