import {
  COLUMN_NAME,
  COLUMN_FIRST_NAME,
  COLUMN_LAST_NAME,
  COLUMN_IFI_KEY,
  COLUMN_ACCOUNT_KEY,
  COLUMN_ACCOUNT_VALUE,
  IDENTIFIER_KEYS,
  COLUMN_ATTRIBUTE_DATA,
  COLUMN_MBOX,
} from 'lib/constants/personasImport';
import {
  includes,
  filter,
  get,
  mapValues,
  chain,
  isNull,
} from 'lodash';

const getRelatedType = (columnType) => {
  if (columnType === COLUMN_ACCOUNT_KEY) {
    return COLUMN_ACCOUNT_VALUE;
  }

  if (columnType === COLUMN_ACCOUNT_VALUE) {
    return COLUMN_ACCOUNT_KEY;
  }

  return undefined;
};

/**
 * @param {immutable.Map} structure
 * @return {string[]} list of columnName
 */
export const getAccountHomePageColumns = structure =>
  structure
    .filter(v => v.get('columnType') !== COLUMN_ACCOUNT_VALUE)
    .keySeq()
    .toJS();

/**
 * @returns {string[]}
 */
export const getPossibleRelatedColumns = ({
  columnType,
  structure, // plain js object
}) => {
  const relatedType = getRelatedType(columnType);

  const structureWithName = mapValues(structure, (value, key) =>
    ({
      columnName: key,
      ...value
    })
  );

  const relatedStructures = filter(structureWithName, column =>
    (relatedType !== undefined && relatedType === column.columnType)
  );

  const relatedColumns = relatedStructures.map(s => s.columnName);

  if (relatedType === '') {
    return ['', ...relatedColumns];
  }
  return relatedColumns;
};

export const resetRelatedStructure = ({
  structure, // immutable.Map
  columnName
}) =>
  structure.map((item, key) => {
    if (
      item.get('relatedColumn') === columnName ||
      key === columnName
    ) {
      let newItem = item;
      if (item.get('columnType') === COLUMN_ACCOUNT_KEY) {
        newItem = item.set('columnType', '');
      }
      return newItem.set('relatedColumn', '');
    }
    return item;
  });


export const updateRelatedStructure = ({
  structure, // immutable.Map
  columnName = '',
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
    const out =
      structureWithRelatedColumn
        .setIn([relatedColumn, 'useConstant'], false)
        .setIn([relatedColumn, 'columnType'], getRelatedType(structure.getIn([columnName, 'columnType'])))
        .setIn([relatedColumn, 'relatedColumn'], columnName);
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
  structure, // plain js object
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

  const firstName = get(row, firstNameColumn, '').trim();
  const lastName = get(row, lastNameColumn, '').trim();

  if (firstName === '' && lastName === '') {
    return undefined;
  }

  return `${firstName} ${lastName}`.trim();
};

const constantToKey = constant =>
  constant
    .replace(/^COLUMN_/i, '')
    .replace(/MBOXSHA1SUM$/i, 'MBOX_SHA1SUM')
    .toLowerCase();

export const getIfis = ({
  structure, // plain js object
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
    .filter(columnStructure => isColumnOrderable({
      columnStructure
    }))
    .orderBy('primary');

  const ifis = ifiKeyColumns.map(({
    columnName,
    columnType,
    relatedColumn,
    useConstant = false,
    constant,
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

    if (columnType === COLUMN_ACCOUNT_VALUE && useConstant === false) {
      if ( // ignore un set rows in the csv
        !row[columnName] ||
        !row[relatedColumn]
      ) {
        return null;
      }

      return {
        key: 'account',
        value: {
          homePage: row[relatedColumn],
          name: row[columnName]
        }
      };
    }

    if (columnType === COLUMN_ACCOUNT_VALUE && useConstant === true /* && [implied] && useConstant === true */) {
      if (!row[columnName]) {
        return null;
      }
      return {
        key: 'account',
        value: {
          homePage: constant,
          name: row[columnName]
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
  structure, // plain js object
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
    relatedColumn,
    attributeName,
  }) => {
    if (!relatedColumn && row[columnName]) {
      // Use attributeName. Use columnName, if attributeName is empty or undefined.
      const attributeKey = attributeName || columnName;
      return {
        key: attributeKey,
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
  structure // immutable.Map
}) => {
  const max = structure
    .max(item =>
      item.get('primary')
    );

  return (max.get('primary', 0) + 1);
};
