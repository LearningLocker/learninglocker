import logger from 'lib/logger';
import * as models from 'lib/models';
import { map } from 'lodash';
import createSiteAdmin from 'cli/commands/createSiteAdmin';

const resetState = async () => {
  await Promise.all(map(models, model => model.remove({})));

  // add a user
  await createSiteAdmin('chris.bishop@ht2labs.com', 'Test organisation', 'password0', {});

  logger.info('Reset success');
};

// RUNTIME_NODE_ENV=test node cli/dist/server seed reset
export default async function (action) {
  logger.info('Seeding the database');
  try {
    if (process.env.RUNTIME_NODE_ENV !== 'test') {
      throw new Error('invalid environment');
    }

    switch (action) {
      case 'reset':
        await resetState();
        break;
      default:
        logger.error('Invalid action');
        throw new Error('Invalid action');
    }
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }

  process.exit(0);
}
