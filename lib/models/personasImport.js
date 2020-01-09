import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';
import timestamps from 'mongoose-timestamp';
import { fromJS } from 'immutable';
import {
  keys,
  chain,
  map,
  includes,
  isUndefined,
  isInteger,
  isNull,
  get,
  uniq,
} from 'lodash';
import * as scopes from 'lib/constants/scopes';
import scopeChecks from 'lib/models/plugins/scopeChecks';
import filterByOrg from 'lib/models/plugins/filterByOrg';
import addCRUDFunctions from 'lib/models/plugins/addCRUDFunctions';
import {
  getPossibleRelatedColumns
} from 'lib/services/importPersonas/personasImportHelpers';
import {
  STAGE_UPLOAD,
  STAGE_CONFIGURE_FIELDS,
  STAGE_IMPORTED,
  STAGE_PROCESSING,
  COLUMN_NAME,
  COLUMN_FIRST_NAME,
  COLUMN_LAST_NAME,
  COLUMN_ACCOUNT_KEY,
  COLUMN_ACCOUNT_VALUE,
  COLUMN_ATTRIBUTE_DATA,
} from 'lib/constants/personasImport';
import moment from 'moment';

/** @typedef {module:lib.models.personasImport.PersonasImportStructure} PersonasImportStructure */
/** @typedef {module:lib.models.personasImport.PersonaImportField} PersonaImportField */
/** @typedef {module:lib.models.personasImport.PersonasImport} PersonasImport */
/** @typedef {module:lib.models.personasImport.PersonasImportError} PersonasImportError */
/** @typedef {module:lib.models.personasImport.PersonasImportResult} PersonasImportResult */
/** @typedef {module:lib.models.personasImport.PersonasImportSchema} PersonasImportSchema */

/**
 * @param {PersonasImportStructure} structure
 * @returns {boolean|Array}
 */
export const validateNoMultipleBindings = (structure) => {
  const multipleRelated = chain(structure)
    .filter(item => item.relatedColumn)
    .groupBy(item => item.relatedColumn)
    .filter(item => item.length > 1)
    .value();

  if (multipleRelated.length > 0) {
    const result = chain(multipleRelated)
      .flatten()
      .map(({ relatedColumn }) => relatedColumn)
      .uniq()
      .value();

    return map(result, column => `${column} is bound multiple times`);
  }

  return false;
};

/**
 * @param {PersonasImportStructure} structure
 * @returns {boolean|string[]}
 */
export const validateIsBound = (structure) => {
  const out = chain(structure)
    .map(
      /**
       * @param {PersonaImportField} value
       * @param {string} key
       * @returns {string[]}
       */
      (value, key) => {
        if (![COLUMN_ACCOUNT_KEY, COLUMN_ACCOUNT_VALUE].includes(value.columnType) && !value.relatedColumn) {
          return [];
        }

        const relatedColumns = getPossibleRelatedColumns({
          structure,
          columnType: value.columnType
        });

        if (!value.relatedColumn && !includes(relatedColumns, '') && !get(value, 'useConstant', false)) {
          return [`${key} is not bound to another column`];
        }

        if (
          get(value, 'useConstant', false) &&
          !get(value, 'constant', '')
            .match(/^http(s?):\/\//)
        ) {
          return [`${key} constant should be a URL`];
        }

        if (![COLUMN_ACCOUNT_KEY, COLUMN_ACCOUNT_VALUE].includes(value.columnType) && value.relatedColumn) {
          return [`${key} is related to ${value.relatedColumn} but ${value.columnType} should have no relation`];
        }

        if (value.relatedColumn && !(structure[value.relatedColumn].relatedColumn === key)) {
          return [`${key} is bound to ${value.relatedColumn} but ${value.relatedColumn} is not bound to ${key}`];
        }

        if (value.relatedColumn && !includes(relatedColumns, value.relatedColumn)) {
          return [`${key} is bound to ${value.relatedColumn} but ${value.relatedColumn} is of an invalid type`];
        }

        return [];
      }
    )
    .flatten()
    .value();

  if (out.length === 0) {
    return false;
  }

  return out;
};

/**
 * @param {PersonasImportStructure} structure
 * @returns {boolean}
 */
export const validatePrimaryUnique = (structure) => {
  const multiplePrimary = chain(structure)
    .filter(item => !isUndefined(item.primary) && !isNull(item.primary))
    .groupBy(item => item.primary)
    .filter(item => item.length > 1)
    .map(item => item.primary)
    .value();

  return multiplePrimary.length <= 0;
};

/**
 * @param {PersonasImportStructure} structure
 * @returns {boolean}
 */
export const validateAttributeName = (structure) => {
  const attributeNames =
    Object.values(structure)
      .filter(s => s.columnType === COLUMN_ATTRIBUTE_DATA)
      .map(s => (s.attributeName || s.columnName));

  return uniq(attributeNames).length === attributeNames.length;
};

/**
 * @param {PersonasImportStructure} structure
 * @returns {boolean}
 */
export const validatePrimaryNumber = (structure) => {
  const invalidStructure = chain(structure)
    .filter(item =>
      !(
        isUndefined(item.primary) ||
        isNull(item.primary) ||
        isInteger(item.primary)
      )
    )
    .value();

  return invalidStructure.length <= 0;
};


/**
 * @param {PersonasImportStructure} structure
 * @returns {{firstNameSize: number, lastNameSize: number, fullNameSize: number}}
 */
const countNameColumns = (structure) => {
  const columnList = fromJS(structure).toList();
  const fullNameSize = columnList.count(c => c.get('columnType') === COLUMN_NAME);
  const firstNameSize = columnList.count(c => c.get('columnType') === COLUMN_FIRST_NAME);
  const lastNameSize = columnList.count(c => c.get('columnType') === COLUMN_LAST_NAME);

  return { fullNameSize, firstNameSize, lastNameSize };
};

/**
 * @param {PersonasImportStructure} structure
 * @returns {boolean}
 */
export const validateOneFullName = (structure) => {
  const { fullNameSize } = countNameColumns(structure);

  return fullNameSize <= 1;
};

/**
 * @param {PersonasImportStructure} structure
 * @returns {boolean}
 */
export const validateOneFirstName = (structure) => {
  const { firstNameSize } = countNameColumns(structure);

  return firstNameSize <= 1;
};

/**
 * @param {PersonasImportStructure} structure
 * @returns {boolean}
 */
export const validateOneLastName = (structure) => {
  const { lastNameSize } = countNameColumns(structure);

  return lastNameSize <= 1;
};

/**
 * @param {PersonasImportStructure} structure
 * @returns {boolean}
 */
export const validateFullNameAndFirstOrLast = (structure) => {
  const { fullNameSize, firstNameSize, lastNameSize } = countNameColumns(structure);

  return fullNameSize === 0 || (firstNameSize === 0 && lastNameSize === 0);
};

const DATE_INFINITY = 8640000000000000;

/** @type {PersonasImportSchema} */
const schema = new mongoose.Schema({
  title: { type: String },
  owner: { type: mongoose.Schema.ObjectId, ref: 'User', index: true },
  organisation: { type: mongoose.Schema.ObjectId, ref: 'Organisation', index: true },
  csvHandle: { type: String },
  csvErrorHandle: { type: String },
  importStage: {
    type: String,
    enum: [STAGE_UPLOAD, STAGE_CONFIGURE_FIELDS, STAGE_PROCESSING, STAGE_IMPORTED],
    default: STAGE_UPLOAD
  },
  totalCount: {
    type: Number
  },
  processedCount: {
    type: Number,
    default: 0
  },
  csvHeaders: [{
    type: String
  }],
  importedAt: {
    type: Date,
    default: moment(DATE_INFINITY).toDate()
  },
  importErrors: {
    type: [{
      row: {
        type: Number
      },
      rowErrors: [{
        type: String
      }]
    }]
  },
  result: {
    created: {
      type: Number,
      default: 0
    },
    merged: {
      type: Number,
      default: 0
    }
  },
  structure: {
    type: mongoose.Schema.Types.Mixed,
    validate: [
      {
        validator() {
          const result = validateNoMultipleBindings(this.structure);

          if (result === false) {
            return true;
          }

          throw new Error(result.join('\n'));
        },
        message: 'validation failed'
      },
      {
        validator() {
          const result = validateIsBound(this.structure);

          if (result === false) {
            return true;
          }

          throw new Error(result.join(', '));
        }
      },
      {
        validator() {
          return validatePrimaryUnique(this.structure);
        },
        message: 'Primary must be unique'
      },
      {
        validator() {
          return validatePrimaryNumber(this.structure);
        },
        message: 'Primary order must be an Integer'
      },
      {
        validator() {
          return validateOneFullName(this.structure);
        },
        message: 'You can not select multiple "Full name"',
      },
      {
        validator() {
          return validateOneFirstName(this.structure);
        },
        message: 'You can not select multiple "First name"',
      },
      {
        validator() {
          return validateOneLastName(this.structure);
        },
        message: 'You can not select multiple "Last name"',
      },
      {
        validator() {
          return validateFullNameAndFirstOrLast(this.structure);
        },
        message: 'You can not select "First name" or "Last name" with "Full name"',
      },
      {
        validator() {
          return validateAttributeName(this.structure);
        },
        message: 'Attribute Name must be unique',
      },
    ],
  },
});

schema.readScopes = keys(scopes.USER_SCOPES);
schema.writeScopes = schema.readScopes;

schema.plugin(timestamps);
schema.plugin(scopeChecks);
schema.plugin(filterByOrg);
schema.plugin(addCRUDFunctions);

schema.index({ organisation: 1, updatedAt: -1, _id: 1 });

export default getConnection().model('PersonasImport', schema, 'personasImports');
