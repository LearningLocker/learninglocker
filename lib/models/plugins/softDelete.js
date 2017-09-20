import _ from 'lodash';
import mongoose from 'mongoose';
/**
 * Provides fields used for soft deletion on Mongoose schemas
 */

function handleSoftDelete(options, callback) {
  this.deleted = true;
  if (options.deletedAt) {
    this.DELETED_AT = new Date();
  }

  // field flushing functionality
  if (options.flush) {
    // reserve some fields from ever being flushed
    const reservedFields = [this.schema.options.versionKey, '_id', 'deleted', 'DELETED_AT', 'CREATED_AT', 'UPDATED_AT'];
    const keepFields = _.union(reservedFields, options.flush.keep || []);

    // loop through all fields and unset where not choosing to keep
    const removeFields = _.difference(options.flush.remove || _.keys(this.schema.paths), keepFields);
    _.each(removeFields, (path) => {
      if (this.schema.paths[path] instanceof mongoose.Schema.Types.Array) {
        this[path] = [];
      } else {
        this[path] = null;
      }
    });
  }

  this.save({ validateBeforeSave: false }, callback);
}


/**
 * Mongoose plugin to provide fields for soft deletion and associated methods and indexes
 * @param  {Schema} schema
 * @param  {Object} options         {deletedAt: use a date in deletions, alwaysReadable: bypass scoping on these fields }
 */
function softDeletePlugin(schema, opts) {
  const options = _.defaults(opts, { deletedAt: true, alwaysReadable: true, flush: false });
  schema.softDeletes = true;

  const dataObj = {};
  dataObj.deleted = { type: Boolean, default: false, alwaysReadable: options.alwaysReadable };
  schema.index({ deleted: -1 });

  // optional date field
  if (options.deletedAt) {
    dataObj.DELETED_AT = { type: Date, default: null, alwaysReadable: options.alwaysReadable };
    schema.index({ DELETED_AT: 1, deleted: 1 });
  }

  // add the fields to the schema
  schema.add(dataObj);

  // process the soft delete using this method
  /* eslint-disable no-prototype-builtins */
  if (!schema.methods.hasOwnProperty('softDeleteHandler')) {
    schema.methods.softDeleteHandler = function handler(callback) {
      handleSoftDelete.bind(this)(options, callback);
    };
  }
}

export default softDeletePlugin;
