import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import logger from 'lib/logger';
import { OrderedMap } from 'immutable';
import migration from 'cli/migrateMongo/models/migration';
import { promisify } from 'bluebird';
import migrator from './index';

chai.use(chaiAsPromised);

describe('migrateMongo', () => {
  let migrationsRun;
  beforeEach(async () => {
    migrationsRun = [];
    await migration.deleteMany({}).exec();
  });

  const migrations = new OrderedMap()
    .set('001-test', {
      up: () => {
        logger.info('up 1');
        migrationsRun.push('001-test-up');
      },
      down: () => {
        logger.info('down 1');
        migrationsRun.push('001-test-down');
      }
    }).set('002-test', {
      up: () => {
        logger.info('up 2');
        migrationsRun.push('002-test-up');
      },
      down: () => {
        logger.info('down 2');
        migrationsRun.push('002-test-down');
      }
    });

  describe('up', () => {
    it('should run all the migrations', async () => {
      await promisify(migrator)({
        migrations,
        dontExit: true,
      });

      expect(migrationsRun.length).to.equal(2);
      expect(migrationsRun).to.deep.equal(['001-test-up', '002-test-up']);

      const dbRunMigrations = await migration.find({
        key: { $in: ['001-test', '002-test'] }
      });
      expect(dbRunMigrations.length).to.equal(2);
    });

    it('should up next', async () => {
      await promisify(migrator)({
        up: 'next',
        migrations,
        dontExit: true,
      });

      expect(migrationsRun.length).to.equal(1);
      expect(migrationsRun).to.deep.equal(['001-test-up']);

      const dbRunMigrations = await migration.find({
        key: { $in: ['001-test'] }
      });
      expect(dbRunMigrations.length).to.equal(1);
    });

    it('should error up next if no up migrations left', async () => {
      await promisify(migrator)({
        migrations,
        dontExit: true,
      });

      const resultPromise = promisify(migrator)({
        up: 'next',
        migrations,
        dontExit: true,
      });

      await expect(resultPromise)
        .to.eventually.be.rejectedWith(Error, 'No outstanding migrations');
    });

    it('should error if up key does not exist', async () => {
      await promisify(migrator)({
        migrations,
        dontExit: true,
      });

      const resultPromise = promisify(migrator)({
        up: '001-test',
        migrations
      });

      await expect(resultPromise).to.eventually.be.rejectedWith(Error, 'Target migration key does not exist in outstanding migrations');
    });
  });

  describe('down', () => {
    beforeEach(async () => {
      await promisify(migrator)({
        migrations,
        dontExit: true,
      });
      migrationsRun = [];
    });

    it('should down previous/last migration', async () => {
      await promisify(migrator)({
        down: 'previous',
        migrations,
        dontExit: true,
      });

      expect(migrationsRun).to.deep.equal(['002-test-down']);

      const dbRunMigrations = await migration.find({
        key: { $in: ['001-test', '002-test'] }
      });

      expect(dbRunMigrations.length).to.equal(1);
      expect(dbRunMigrations[0].key).to.equal('001-test');
    });

    it('should down to target migration', async () => {
      await promisify(migrator)({
        down: '001-test',
        migrations,
        dontExit: true,
      });

      expect(migrationsRun).to.deep.equal(['002-test-down', '001-test-down']);
    });

    it('should error if down not existing target migration', async () => {
      await promisify(migrator)({
        down: '002-test',
        migrations,
        dontExit: true,
      });

      const result = promisify(migrator)({
        down: '002-test',
        migrations,
        dontExit: true,
      });

      await expect(result).to.eventually.be.rejectedWith(
        Error,
        'Down key (002-test) not found in the database'
      );
    });

    it('should error if down is last but there are no run migrations', async () => {
      await promisify(migrator)({
        down: '001-test',
        migrations,
        dontExit: true,
      });

      const result = promisify(migrator)({
        down: 'previous',
        migrations,
        dontExit: true,
      });

      await expect(result).to.eventually.be.rejectedWith(
        Error,
        'No migrations have been run, ergo down is invalid'
      );
    });
  });

  describe('up down', () => {
    const migrationsError = new OrderedMap()
      .set('001-test', {
        up: () => {
          logger.info('up 1');
          migrationsRun.push('001-test-up');
        },
        down: () => {
          logger.info('down 1');
          migrationsRun.push('001-test-down');
        }
      }).set('002-test', {
        up: () => {
          logger.info('up 2');
          migrationsRun.push('002-test-up');
          throw new Error('migration failed');
        },
        down: () => {
          logger.info('down 2');
          migrationsRun.push('002-test-down');
        }
      });

    it('should revert if an up migration fails', async () => {
      try {
        await promisify(migrator)({
          migrations: migrationsError,
          dontExit: true,
        });
      } catch (err) {
        expect(err.message).to.equal('migration failed');
      }

      expect(migrationsRun).to.deep.equal(['001-test-up', '002-test-up', '002-test-down']);

      const dbRunMigrations = await migration.find({
        key: { $in: ['001-test', '002-test'] }
      });
      expect(dbRunMigrations.length).to.equal(1);
      expect(dbRunMigrations[0].key).to.equal('001-test');
    });
  });
  describe('up changed past', () => {
    beforeEach(async () => {
      await promisify(migrator)({
        migrations,
        dontExit: true,
      });
    });

    it('should error if no migrations are suplied', async () => {
      const result = promisify(migrator)({
        // no migrations
      });

      await expect(result).to.eventually.be.rejectedWith(Error);
    });
  });
  describe('fix order', () => {
    it('should set the order', async () => {
      await promisify(migrator)({
        migrations,
        dontExit: true
      });

      const dbRunMigrations = await migration.find({
        key: { $in: ['001-test', '002-test'] }
      });
      expect(dbRunMigrations.length).to.equal(2);
      expect(dbRunMigrations[0].order).to.equal(1);
      expect(dbRunMigrations[1].order).to.equal(2);
    });

    it('should reorder', async () => {
      await promisify(migrator)({
        migrations,
        dontExit: true
      });

      const dbRunMigrations = await migration.find({
        key: { $in: ['001-test', '002-test'] }
      });
      dbRunMigrations[0].order = 2;
      await dbRunMigrations[0].save();

      dbRunMigrations[1].order = 1;
      await dbRunMigrations[1].save();

      await promisify(migrator)({
        migrations,
        dontExit: true,
        fixOrder: true
      });

      const dbRunMigrations2 = await migration.find({
        key: { $in: ['001-test', '002-test'] }
      });

      expect(dbRunMigrations2[0].order).to.equal(1);
      expect(dbRunMigrations2[1].order).to.equal(2);

      let errored = false;
      try {
        await promisify(migrator)({
          migrations,
          dontExit: true,
        });
      } catch (err) {
        errored = true;
      }
      expect(errored).to.equal(false);
    });

    it('should migrate if first items have no order', async () => {
      await promisify(migrator)({
        migrations,
        dontExit: true
      });

      const dbRunMigrations = await migration.find({
        key: { $in: ['001-test', '002-test'] }
      });
      dbRunMigrations[0].order = null;
      await dbRunMigrations[0].save();

      await promisify(migrator)({
        migrations,
        dontExit: true
      });

      const dbRunMigrations2 = await migration.find({
        key: { $in: ['001-test', '002-test'] }
      });

      expect(dbRunMigrations2[0].order).to.equal(null);
      expect(dbRunMigrations2[1].order).to.equal(2);
    });
  });
});
