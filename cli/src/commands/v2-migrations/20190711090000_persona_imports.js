import { map as bmap } from 'bluebird';
import { filter, get, forEach, set, toPairs, unset, cloneDeep } from 'lodash';
import PersonasImports from 'lib/models/personasImport';
import highland from 'highland';

const BATCH_SIZE = 10000;

const up = async () => {
  const personasImportsSream = highland(PersonasImports.find({}).cursor());

  const migrationStream = personasImportsSream.batch(BATCH_SIZE).flatMap((personasImports) => {
    const donePromise = bmap(personasImports, async (personasImport) => {
      const toMove = filter(toPairs(personasImport.structure), (structurePair) => {
        const structure = structurePair[1];
        return get(structure, 'columnType') === 'COLUMN_ACCOUNT_KEY';
      });
      if (toMove.length === 0) {
        // Nothing to do
        return;
      }

      const newStructure = cloneDeep(personasImport.structure);

      forEach(toMove, (toMov) => {
        const key = toMov[0];
        const value = toMov[1];
        set(newStructure, [get(value, 'relatedColumn'), 'primary'], get(value, 'primary'));
        unset(newStructure, [key, 'primary']);
      });

      personasImport.structure = newStructure;
      await personasImport.save();
    }, { concurrency: 1 });

    return highland(donePromise);
  });

  await new Promise((resolve, reject) => {
    migrationStream.on('error', reject);
    migrationStream.apply(resolve);
  });
};

const down = async () => {
  const personasImportsSream = highland(PersonasImports.find({}).cursor());

  const migrationStream = personasImportsSream.batch(BATCH_SIZE).flatMap((personasImports) => {
    const donePromise = bmap(personasImports, async (personasImport) => {
      const toMove = filter(toPairs(personasImport.structure), (structurePair) => {
        const structure = structurePair[1];
        return get(structure, 'columnType') === 'COLUMN_ACCOUNT_VALUE';
      });
      if (toMove.length === 0) {
        // Nothing to do
        return;
      }

      const newStructure = cloneDeep(personasImport.structure);

      forEach(toMove, (toMov) => {
        const key = toMov[0];
        const value = toMov[1];
        set(newStructure, [get(value, 'relatedColumn'), 'primary'], get(value, 'primary'));
        unset(newStructure, [key, 'primary']);
      });

      personasImport.structure = newStructure;
      await personasImport.save();
    }, { concurrency: 1 });

    return highland(donePromise);
  });

  await new Promise((resolve, reject) => {
    migrationStream.on('error', reject);
    migrationStream.apply(resolve);
  });
};

export default { up, down };
