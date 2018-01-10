import logger from 'lib/logger';
import migration from 'cli/migrateMongo/models/migration';
import { isBoolean, isString, map } from 'lodash';
import v2Migrations from 'cli/commands/v2-migrations';
import { OrderedMap, List } from 'immutable';
import migrate from './migrate';

const getOutstandingMigrations = async ({ down, up, migrations }) => {
  const lastMigration = await migration.findOne({}).sort({ updatedAt: -1 });

  const lastKey = lastMigration ? lastMigration.key : null;
  if (down) {
    if (!isString(down)) {
      throw new Error("down should be a string, either 'last' or the target migration");
    }
    if (!lastMigration) {
      throw new Error('No migrations have been run, ergo down is invalid');
    }

    if (down === 'last' || down === 'previous') {
      return new OrderedMap().set(lastKey, migrations.get(lastKey));
    }

    const firstMigration = await migration.findOne({ key: down });

    if (!firstMigration) {
      throw new Error(`Down key (${down}) not found in the database`);
    }

    const toRunMigrations = await migration
      .find({
        updatedAt: {
          $gte: firstMigration.updatedAt,
          $lte: lastMigration.updatedAt
        }
      })
      .sort({
        updatedAt: -1
      });

    const toRunMigrations2 = toRunMigrations.map((model) => {
      if (!migrations.get(model.key)) {
        throw new Error(`Migration ${model.key} not found in migrations`);
      }
      return [model.key, migrations.get(model.key)];
    });

    return new OrderedMap(toRunMigrations2);
  }

  const outstandingMigrations = lastKey
    ? migrations.skipUntil((item, key) => key === lastKey).slice(1)
    : migrations;

  if (up && !isBoolean(up)) {
    if (up === 'next' && lastKey) {
      const upMigrations = migrations.skipUntil((item, key) => key === lastKey).slice(1, 2);

      if (upMigrations.size === 0) {
        throw new Error('No outstanding migrations');
      }

      return upMigrations;
    }
    if (up === 'next' && !lastKey) {
      // run first item
      return migrations.slice(0, 1);
    }

    if (!outstandingMigrations.get(up)) {
      throw new Error('Target migration key does not exist in outstanding migrations');
    }

    return outstandingMigrations
      .reverse() // as takeUntil is not inclusive :(
      .skipUntil((item, key) => key === up)
      .reverse();
  }

  return outstandingMigrations;
};

const checkRunMigrations = async ({ migrations }) => {
  const dbMigrations = new List(await migration.find({}));
  const actualMigrations = new List(migrations);
  const allMigrations = dbMigrations.zip(actualMigrations);

  if (allMigrations.size !== dbMigrations.size) {
    throw new Error('Db does not match the migrations - you may still have the v1 migrations collection');
  }

  allMigrations.forEach((item) => {
    const dbMigration = item[0];
    const actualMigration = item[1];

    if (dbMigration.key !== actualMigration[0]) {
      throw new Error(`Db migration (${dbMigration.key}) does not match (${actualMigration[0]})`);
    }

    // if (
    //   dbMigration.upFn.toString().replace(/\s/g) !== actualMigration[1].up.toString().replace(/\s/g)
    // ) {
    //   throw new Error(
    //     `db up migration for (${actualMigration[0]}) does not match the function that was run`
    //   );
    // }
  });
};

const doMigrations = async ({ down, up, migrations }) => {
  if (down && isBoolean(down)) {
    throw new Error('down must take a target file name');
  }

  if (down && up) {
    throw new Error('down and up can not both be defined');
  }

  if (!down) {
    await checkRunMigrations({ migrations });
  }

  const migrationsToRun = await getOutstandingMigrations({ down, up, migrations });

  if (migrationsToRun.size === 0) {
    logger.info('No migrations to run');
    return;
  }

  logger.info(
    `Running ${down ? 'down' : 'up'} migrations on:\n\t\t${migrationsToRun.keySeq().join('\n\t\t')}`
  );

  await migrate({ migrations: migrationsToRun, down });
};

const displayInfo = async ({ info, migrations }) => {
  const verbose = info === 'v' || info === 'verbose';

  if (!verbose) {
    const lastRunMigration = await migration.findOne().sort({ updatedAt: -1 });

    if (!lastRunMigration) {
      logger.info('No migrations have been run');
    } else {
      logger.info('Last run migration: ', lastRunMigration.key);
    }
  } else {
    const runMigrations = await migration.find().sort({ updatedAt: 1 });

    const output = map(runMigrations, item => item.key);

    if (output.length === 0) {
      logger.info('No migrations have been run');
    } else {
      logger.info(`Run migrations: \n\t\t${output.join('\n\t\t')}`);
    }
  }

  const outstandingMigrations = await getOutstandingMigrations({ migrations });

  if (outstandingMigrations.size > 0) {
    const outstandingMigrationsString = outstandingMigrations
      .keySeq()
      .toJS()
      .join('\n\t\t');
    logger.info(`Outstanding migrations:\n\t\t${outstandingMigrationsString}`);
  } else {
    logger.info('No outstanding migrations');
  }
};

export default async function ({ down, up, info, migrations = v2Migrations }, next = null) {
  try {
    if (info) {
      await displayInfo({ info, migrations });
    } else {
      await doMigrations({ down, up, migrations });
    }
    process.exit();
  } catch (err) {
    if (next) {
      next(err);
    } else {
      if (err) {
        console.error(err);
      }
      process.exit();
    }
  }
}
