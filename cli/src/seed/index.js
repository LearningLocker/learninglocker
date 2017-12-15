import logger from 'lib/logger';
import * as models from 'lib/models';
import { map } from 'lodash';
import createSiteAdmin from 'cli/commands/createSiteAdmin';
import { createOrgJWT, createUserJWT } from 'api/auth/jwt';
import { getCookieName } from 'ui/utils/auth';
import User from 'lib/models/user';
import Organisation from 'lib/models/organisation';
import { getConnection } from 'lib/connections/mongoose';

const resetState = async () => {
  const connection = getConnection();
  await connection.dropDatabase();

  // add a user
  await createSiteAdmin('chris.bishop@ht2labs.com', 'Test organisation', 'password0', {});

  logger.info('Reset success');
};

const getToken = async () => {
  const user = await User.findOne({
    email: 'chris.bishop@ht2labs.com'
  });

  const organisation = await Organisation.findOne({
    name: 'Test organisation'
  });

  const orgCookieName = getCookieName({ tokenType: 'organisation', tokenId: organisation._id });
  const orgJwtToken = await createOrgJWT(user, organisation._id, 'native');

  const userCookieName = getCookieName({ tokenType: 'user', tokenId: user._id });
  const userJwtToken = await createUserJWT(user, 'native');

  const cookies = {
    [orgCookieName]: orgJwtToken,
    [userCookieName]: userJwtToken
  };

  process.stdout.write(JSON.stringify({
    cookies,
    organisationId: organisation._id,
    userId: user._id
  }));
};

// RUNTIME_NODE_ENV=test node cli/dist/server seed reset
export default async function (action) {
  try {
    if (process.env.RUNTIME_NODE_ENV !== 'test') {
      throw new Error('invalid environment');
    }

    switch (action) {
      case 'reset': {
        logger.info('Seeding the database');
        await resetState();
        break;
      }
      case 'getToken': {
        await getToken();
        break;
      }
      default: {
        logger.error('Invalid action');
        throw new Error('Invalid action');
      }
    }
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }

  process.exit(0);
}
