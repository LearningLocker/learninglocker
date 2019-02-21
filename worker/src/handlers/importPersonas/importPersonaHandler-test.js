import {
  TEST_ORG_ID,
} from 'lib/services/auth/tests/utils/constants';
import ImportPersonasLock from 'lib/models/importPersonasLock';
import { expect } from 'chai';
import { delay } from 'bluebird';
import { establishLock } from './importPersonaHandler';

describe('importPersonaHandler', () => {
  beforeEach(async () => {
    await ImportPersonasLock.deleteMany({});
  });

  it('should establish a lock', async () => {
    const ifis1 = [{
      key: 'mbox',
      value: 'mailto:nameA@test.com'
    }];

    const ifis2 = [{
      key: 'mbox',
      value: 'mailto:nameA@test.com'
    }, {
      key: 'mbox',
      value: 'mailto:nameB@test.com'
    }];

    const result1 = await establishLock({
      organisation: TEST_ORG_ID,
      ifis: ifis1
    });

    expect(result1).to.be.ok; // eslint-disable-line no-unused-expressions

    const result2 = await establishLock({
      organisation: TEST_ORG_ID,
      ifis: ifis2
    });

    expect(result2).to.equal(false);
  });

  it('should establish a lock on timeout fial', async () => {
    const ifis1 = [{
      key: 'mbox',
      value: 'mailto:nameA@test.com'
    }];

    const result1 = await establishLock({
      organisation: TEST_ORG_ID,
      ifis: ifis1,
      lockTimeout: 300
    });

    expect(result1).to.be.ok; // eslint-disable-line no-unused-expressions

    await delay(1000);

    const result2 = await establishLock({
      organisation: TEST_ORG_ID,
      ifis: ifis1,
      lockTimeout: 300
    });

    expect(result2).to.be.ok; // eslint-disable-line no-unused-expressions
  }).timeout(5000);
});
