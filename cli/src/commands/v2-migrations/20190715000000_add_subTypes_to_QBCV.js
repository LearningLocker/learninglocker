import migrateAddingSubTypesToQBCV, { removeSubTypesFromQBCV } from '../migrateAddingSubTypesToQBCV';

const up = async () => {
  await migrateAddingSubTypesToQBCV();
};

const down = async () => {
  await removeSubTypesFromQBCV();
};

export default { up, down };
