import moment from 'moment';
import ImportPersonasLock from 'lib/models/importPersonasLock';
import { getIfis } from 'lib/services/importPersonas/personasImportHelpers';

const LOCK_TIMEOUT = 120 * 1000; // seconds

export default async ({
  structure,
  data,
  organisation,
  ifis = getIfis({
    structure,
    row: data
  }), // private
  lockTimeout = LOCK_TIMEOUT // testing
}) => {
  const minimumCreatedAt = moment().subtract(lockTimeout, 'milliseconds').toDate();
  await ImportPersonasLock.deleteMany({
    organisation,
    ifis: { $in: ifis },
    createdAt: { $lt: minimumCreatedAt },
  });
  return ImportPersonasLock.create({
    organisation,
    ifis
  });
};
