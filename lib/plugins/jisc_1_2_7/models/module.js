import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';
import timestamps from 'mongoose-timestamp';
import softDeletePlugin from 'lib/models/plugins/softDelete';
import filterByOrg from 'lib/models/plugins/filterByOrg';
import fieldScoping from 'lib/plugins/jisc_1_2_7/models/plugins/fieldScoping';
import scopeChecks from 'lib/models/plugins/scopeChecks';
import subjectCodes from 'lib/plugins/jisc_1_2_7/utils/subjectCodes';
import async from 'async';
import * as scopes from 'lib/constants/scopes';
import { updateForeignSingular,
         updateLocalMultiple } from 'lib/plugins/jisc_1_2_7/utils/relations';

const schema = new mongoose.Schema({
  MOD_ID: { type: String, required: true, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP, scopes.OPENDASH] },
  MOD_NAME: { type: String, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP, scopes.OPENDASH] },
  MOD_SUBJECT: {
    type: String,
    maxLength: 255,
    enum: {
      values: subjectCodes.concat([null]),
      message: '`{PATH}`: `{VALUE}` is not a valid subject code. See https://github.com/jiscdev/analytics-udd/blob/master/media/jacs3-valid-entries.csv for information.'
    },
    readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP, scopes.OPENDASH]
  },
  MOD_CREDITS: { type: Number, min: 0, max: 999, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP, scopes.OPENDASH] },
  MOD_LEVEL: { type: String, enum: [0, 1, 2, 3, 4, 5, 6, 7, 9, 'A', 'B', 'C', 'D', 'E', null], readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP, scopes.OPENDASH] },

  /**
  * Relations
  */
  moduleInstances: { type: [{ type: mongoose.Schema.ObjectId, ref: 'ModuleInstance' }], readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP, scopes.OPENDASH] },
  organisation: { type: mongoose.Schema.ObjectId, ref: 'Organisation' }
});
schema.index({ organisation: 1, MOD_ID: 1 }, { unique: true });
const baseScopes = [scopes.ALL, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP, scopes.OPENDASH];
schema.readScopes = baseScopes.concat([scopes.UDD_READ]);
schema.writeScopes = baseScopes;

schema.plugin(timestamps, {
  createdAt: 'CREATED_AT',
  updatedAt: 'UPDATED_AT'
});

schema.plugin(softDeletePlugin, {
  flush: {
    keep: ['organisation', 'MOD_ID']
  }
});
schema.plugin(filterByOrg);
schema.plugin(fieldScoping);
schema.plugin(scopeChecks);

const updateForeignRelations = (model, removeRelations, next) => {
  const ModuleInstance = getConnection('JISC_1_2_7').model('ModuleInstance');

  const query = {
    MOD_ID: model.MOD_ID,
    organisation: model.organisation
  };

  async.parallel([
    // 'ModuleInstance.module'
    done => updateForeignSingular(ModuleInstance, model, removeRelations, query, 'module', done),
  ], next);
};

const updateLocalRelations = (model, next) => {
  const ModuleInstance = getConnection('JISC_1_2_7').model('ModuleInstance');

  const query = {
    MOD_ID: model.MOD_ID,
    organisation: model.organisation
  };

  async.parallel([
    // this.moduleInstances
    done => updateLocalMultiple(ModuleInstance, model, query, 'moduleInstances', done),
  ], next);
};

schema.pre('save', function preSave(next) {
  const model = this;
  const removeForeignRelations = model.deleted;
  async.parallel([
    updateForeignRelations.bind(null, model, removeForeignRelations),
    updateLocalRelations.bind(null, model)
  ], next);
});

schema.pre('remove', function preDelete(next) {
  const model = this;
  const removeForeignRelations = true;
  async.parallel([
    updateForeignRelations.bind(null, model, removeForeignRelations)
  ], next);
});

schema.set('toObject', { virtuals: true });

export default getConnection('JISC_1_2_7').model('Module', schema, 'jiscModules');
