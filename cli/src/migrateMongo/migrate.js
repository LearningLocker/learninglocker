import { reduce } from 'bluebird';
import { List } from 'immutable';
import logger from 'lib/logger';
import Migration from 'cli/migrateMongo/models/migration';

const downFn = async ({ key, down }) => {
  logger.info(`Starting down migration of ${key}`);

  await down();
  await Migration.find({ key })
    .remove()
    .exec();

  logger.info(`Finished down migration of ${key}`);
};

const migrateOne = async ({ migrationKey, migration, down: doDown, order }) => {
  const { up, down } = migration;

  if (doDown) {
    const out = await downFn({
      key: migrationKey,
      down
    });
    return out;
  }

  try {
    logger.info(`Starting up migration of ${migrationKey}`);
    await up();

    const out = await new Migration({
      key: migrationKey,
      upFn: up.toString(),
      order
    }).save();
    logger.info(`Finished up migration of ${migrationKey}`);
    return out;
  } catch (err) {
    logger.error(`Error migrating up ${migrationKey}, Reverting ${migrationKey}`);
    await downFn({
      key: migrationKey,
      down
    });
    throw err;
  }
};

const migrate = async ({ migrations, down }) => {
  await reduce(
    new List(migrations).toJS(),
    (acc, migration) => {
      const key = migration[0];
      const value = migration[1];

      return migrateOne({
        migrationKey: key,
        migration: value,
        order: (acc || { order: 0 }).order + 1,
        down
      });
    },
    null
  );
};

export default migrate;
