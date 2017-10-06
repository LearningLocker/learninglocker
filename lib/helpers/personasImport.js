import { RELATED_COLUMN_MAP } from 'lib/constants/personasImport';
import {
  includes,
  filter,
  mapValues,
  chain,
  findKey
} from 'lodash';

export const allRelated = chain(RELATED_COLUMN_MAP)
  .mapValues(
    (value, key) => [key, ...value.related]
  )
  .toArray()
  .flatten()
  .value();


export const hasRelatedField = (columnType) => {
  if (includes(
    allRelated,
    columnType
  )) {
    return true;
  }

  return false;
};


const getRelatedTypes = (columnType) => {
  if (RELATED_COLUMN_MAP[columnType]) {
    return RELATED_COLUMN_MAP[columnType].related;
  }

  const relatedKey = findKey(RELATED_COLUMN_MAP, ({ related }) => includes(related, columnType));
  if (relatedKey) {
    if (RELATED_COLUMN_MAP[relatedKey].keyOptional) {
      return ['', relatedKey];
    }
    return [relatedKey];
  }

  return []; // no related
};

export const getPossibleRelatedColumns = ({
  columnType,
  structure // raw object
}) => {
  const relatedTypes = getRelatedTypes(columnType);

  const structureWithName = mapValues(structure, (value, key) =>
    ({
      columnName: key,
      ...value
    })
  );

  const relatedStructures = filter(structureWithName, column =>
    includes(relatedTypes, column.columnType)
  );

  const out = chain(relatedStructures)
    .map(({ columnName }) => columnName)
    .value();

  if (
    includes(relatedTypes, '')
  ) {
    return ['', ...out];
  }

  return out;
};

export const resetRelatedStructure = ({
  structure, // immutablejs
  columnName
}) =>
  structure.map((item, key) => {
    if (
      item.get('relatedColumn') === columnName ||
      key === columnName
    ) {
      return item.set('relatedColumn', '');
    }
    return item;
  });


export const updateRelatedStructure = ({
  structure, // immutablejs
  columnName,
  relatedColumn
}) => {
  const resetStructure = resetRelatedStructure({
    structure,
    columnName
  });

  const resetStructureRelated = resetRelatedStructure({
    structure: resetStructure,
    columnName: relatedColumn
  });

  const structureWithRelatedColumn = resetStructureRelated.setIn([columnName, 'relatedColumn'], relatedColumn);

  if (relatedColumn) {
    const out = structureWithRelatedColumn.setIn([relatedColumn, 'relatedColumn'], columnName);
    return out;
  }

  return structureWithRelatedColumn;
};

