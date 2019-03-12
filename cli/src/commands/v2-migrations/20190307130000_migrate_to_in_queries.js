import migrateToInQueries from '../migrateToInQueries';
import migrateFromInQueries from '../migrateFromInQueries';

const up = async () => {
  migrateToInQueries();
};

const down = async () => {
  migrateFromInQueries();
};

export default { up, down };
