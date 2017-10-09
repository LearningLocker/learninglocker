import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';
import timestamps from 'mongoose-timestamp';
import {
  keys,
  chain,
  map,
  includes,
  isUndefined,
  isInteger,
  isNull
} from 'lodash';
import * as scopes from 'lib/constants/scopes';
import scopeChecks from 'lib/models/plugins/scopeChecks';
import filterByOrg from 'lib/models/plugins/filterByOrg';
import addCRUDFunctions from 'lib/models/plugins/addCRUDFunctions';
import {
  hasRelatedField,
  getPossibleRelatedColumns
} from 'lib/helpers/personasImport';

import {
  STAGE_UPLOAD,
  STAGE_CONFIGURE_FIELDS
} from 'lib/constants/personasImport';

export const validateNoMutipleBindings = (structure) => {
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

export const validateIsBound = (structure) => {
  const out = chain(structure)
    .map((value, key) => {
      if (!hasRelatedField(value.columnType) && !value.relatedColumn) {
        return [];
      }

      const relatedColumns = getPossibleRelatedColumns({
        structure,
        columnType: value.columnType
      });

      if (!value.relatedColumn && !includes(relatedColumns, '')) {
        return [`${key} is not bound to another column`];
      }

      if (!hasRelatedField(value.columnType) && value.relatedColumn) {
        return [`${key} is related to ${value.relatedColumn} but ${value.columnType} should have no relation`];
      }

      if (value.relatedColumn && !(structure[value.relatedColumn].relatedColumn === key)) {
        return [`${key} is bound to ${value.relatedColumn} but ${value.relatedColumn} is not bound to ${key}`];
      }

      if (value.relatedColumn && !includes(relatedColumns, value.relatedColumn)) {
        return [`${key} is bound to ${value.relatedColumn} but ${value.relatedColumn} is of an invalid type`];
      }
      return [];
    })
    .flatten()
    .value();

  if (out.length === 0) {
    return false;
  }
  return out;
};

export const validatePrimaryUnique = (structure) => {
  const multiplePrimary = chain(structure)
    .filter(item => !isUndefined(item.primary))
    .groupBy(item => item.primary)
    .filter(item => item.length > 1)
    .map(item => item.primary)
    .value();

  if (multiplePrimary.length > 0) {
    return false; // failure
  }
  return true;
};

export const validatePrimaryNumber = (structure) => {
  console.log('structure', structure);
  const invalidStructure = chain(structure)
    .filter(item =>
      !(
        isUndefined(item.primary) ||
        isNull(item.primary) ||
        isInteger(item.primary)
      )
    )
    .value();

  if (invalidStructure.length > 0) {
    return false;
  }

  return true;
};

const schema = new mongoose.Schema({
  title: { type: String },
  owner: { type: mongoose.Schema.ObjectId, ref: 'User', index: true },
  organisation: { type: mongoose.Schema.ObjectId, ref: 'Organisation', index: true },
  isPublic: { type: Boolean, default: false },
  csvHandle: { type: String },
  importStage: {
    type: String,
    enum: [STAGE_UPLOAD, STAGE_CONFIGURE_FIELDS],
    default: STAGE_UPLOAD
  },
  csvHeaders: [{
    type: String
  }],
  structure: {
    type: mongoose.Schema.Types.Mixed,
    validate: [{
      validator: (value, cb) => {
        const result = validateNoMutipleBindings(value);
        cb(!result, result && result.join('\n'));
      },
      message: 'validation failed'
    },
    {
      validator: (value, cb) => {
        const result = validateIsBound(value);
        cb(!result, result && result.join('\n'));
      }
    },
    {
      validator: (value) => {
        const result = validatePrimaryUnique(value);
        return result;
      },
      message: 'Primary must be unqiue'
    }, {
      validator: (value) => {
        const result = validatePrimaryNumber(value);
        return result;
      },
      message: 'Primary order must be an Integer'
    }]
    // {[columnName]: {
    //   columnName: { type: String },
    //   columnType: {
    //     type: String,
    //     enum: COLUMN_TYPES
    //   },
    //   relatedColumn: { // related column name, optional.
    //     type: String
    //   },
    //   primary: { // null or the order that we apply this as a primary key.
    //     type: Number
    //   }
    // }}
  }
});

schema.readScopes = keys(scopes.USER_SCOPES);
schema.writeScopes = schema.readScopes;

schema.plugin(timestamps);
schema.plugin(scopeChecks);
schema.plugin(filterByOrg);
schema.plugin(addCRUDFunctions);

schema.index({ organisation: 1, updatedAt: -1, _id: 1 });

export default getConnection().model('PersonasImport', schema, 'personasImports');
