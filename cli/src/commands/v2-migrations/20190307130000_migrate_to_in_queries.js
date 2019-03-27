import migrateToInQueries from '../migrateToInQueries';
import migrateFromInQueries from '../migrateFromInQueries';

const up = async () => {
  await migrateToInQueries();
};

const down = async () => {
  await migrateFromInQueries();
};

export default { up, down };
