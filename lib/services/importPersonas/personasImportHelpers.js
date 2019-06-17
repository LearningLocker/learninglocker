import {
  RELATED_COLUMN_MAP,
  COLUMN_NAME,
  COLUMN_FIRST_NAME,
  COLUMN_LAST_NAME,
  COLUMN_IFI_KEY,
  COLUMN_ACCOUNT_KEY,
  IDENTIFIER_KEYS,
  COLUMN_ATTRIBUTE_DATA,
  COLUMN_MBOX
} from 'lib/constants/personasImport';
import {
  includes,
  filter,
  mapValues,
  chain,
  findKey,
  isNull
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

export const isColumnOrderable = ({
  columnStructure
}) => {
  if (!columnStructure) {
    return false;
  }

  return includes(IDENTIFIER_KEYS, columnStructure.columnType);
};

export const getPersonaName = ({
  structure, // plain js
  row
}) => {
  const nameColumn = chain(structure)
    .findKey(item => item.columnType === COLUMN_NAME)
    .value();

  if (nameColumn !== undefined) {
    return row[nameColumn];
  }

  const firstNameColumn = chain(structure)
    .findKey(item => item.columnType === COLUMN_FIRST_NAME)
    .value();

  const lastNameColumn = chain(structure)
    .findKey(item => item.columnType === COLUMN_LAST_NAME)
    .value();

  const firstName = row[firstNameColumn];
  const lastName = row[lastNameColumn];

  if (firstName) {
    if (lastName) {
      return `${firstName} ${lastName}`;
    }
    return firstName;
  }

  if (lastName) {
    return lastName;
  }
  return undefined;
};

const constantToKey = constant =>
  constant
    .replace(/^COLUMN_/i, '')
    .replace(/MBOXSHA1SUM$/i, 'MBOX_SHA1SUM')
    .toLowerCase();

export const getIfis = ({
  structure, // plain js
  row
}) => {
  const ifiKeyColumns = chain(structure)
    .mapValues(
      (value, key) => ({
        ...value,
        columnName: key
      })
    )
    .toArray()
    .filter(({ columnType }) => includes(IDENTIFIER_KEYS, columnType))
    .orderBy('primary');

  const ifis = ifiKeyColumns.map(({
    columnName,
    columnType,
    relatedColumn
  }) => {
    if (columnType === COLUMN_IFI_KEY) {
      if ( // ignore un set rows in the csv
        !row[columnName] ||
        !row[relatedColumn]
      ) {
        return null;
      }
      return {
        key: row[columnName].toLowerCase(),
        value: row[relatedColumn]
      };
    }

    if (columnType === COLUMN_ACCOUNT_KEY) {
      if ( // ignore un set rows in the csv
        !row[columnName] ||
        !row[relatedColumn]
      ) {
        return null;
      }

      return {
        key: 'account',
        value: {
          homePage: row[columnName],
          name: row[relatedColumn]
        }
      };
    }

    if (!row[columnName]) { // ignore un set rows in the csv
      return null;
    }

    if (columnType === COLUMN_MBOX && !row[columnName].match(/^mailto:/)) {
      row[columnName] = `mailto:${row[columnName]}`;
    }

    return {
      key: constantToKey(columnType),
      value: row[columnName]
    };
  })
  .filter(item => !isNull(item))
  .value();

  return ifis;
};

export const getAttributes = ({
  structure, // plain js
  row
}) => {
  const attributeColumns = chain(structure)
    .mapValues(
      (value, key) => ({
        ...value,
        columnName: key
      })
    )
    .toArray()
    .filter(({ columnType }) => columnType === COLUMN_ATTRIBUTE_DATA);

  const attributes = attributeColumns.map(({
    columnName,
    relatedColumn
  }) => {
    if (!relatedColumn && row[columnName]) { // if no relate column, use the heading.
      return {
        key: columnName,
        value: row[columnName]
      };
    }

    if (relatedColumn && row[relatedColumn] && row[columnName]) {
      return {
        key: row[relatedColumn],
        value: row[columnName]
      };
    }

    return null;
  }).filter(item => !isNull(item))
  .value();

  return attributes;
};

export const getPrimaryMaxPlusOne = ({
  structure // immutable
}) => {
  const max = structure
    .max(item =>
      item.get('primary')
    );

  return (max.get('primary', 0) + 1);
};
