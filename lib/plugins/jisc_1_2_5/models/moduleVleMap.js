import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';
import timestamps from 'mongoose-timestamp';
import softDeletePlugin from 'lib/models/plugins/softDelete';
import filterByOrg from 'lib/models/plugins/filterByOrg';
import fieldScoping from 'lib/plugins/jisc_1_2_5/models/plugins/fieldScoping';
import scopeChecks from 'lib/models/plugins/scopeChecks';
import async from 'async';
import * as scopes from 'lib/constants/scopes';
import { updateForeignMultiple,
         updateLocalSingular } from 'lib/plugins/jisc_1_2_5/utils/relations';

const schema = new mongoose.Schema({
  MOD_INSTANCE_ID: { type: String, required: true, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.STUDENT_APP, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.OPENDASH] },
  VLE_MOD_ID: { type: String, required: true, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.STUDENT_APP, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.OPENDASH] },

  /**
  * Relations
  */
  moduleInstance: { type: mongoose.Schema.ObjectId, ref: 'ModuleInstance', readAccess: [scopes.ALL, scopes.UDD_READ, scopes.STUDENT_APP, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.OPENDASH] },
  organisation: { type: mongoose.Schema.ObjectId, ref: 'Organisation' }
});
const baseScopes = [scopes.ALL, scopes.STUDENT_APP, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.OPENDASH];
schema.readScopes = baseScopes.concat([scopes.UDD_READ]);
schema.writeScopes = baseScopes;

schema.plugin(timestamps, {
  createdAt: 'CREATED_AT',
  updatedAt: 'UPDATED_AT'
});

schema.plugin(softDeletePlugin, {
  flush: {
    keep: ['organisation']
  }
});
schema.plugin(filterByOrg);
schema.plugin(fieldScoping);
schema.plugin(scopeChecks);

const updateForeignRelations = (model, next) => {
  const ModuleInstance = getConnection('JISC_1_2_5').model('ModuleInstance');

  async.parallel([
    // ModuleInstance.moduleVleMaps
    done => updateForeignMultiple(ModuleInstance, model, {
      MOD_INSTANCE_ID: model.MOD_INSTANCE_ID,
      organisation: model.organisation
    }, 'moduleVleMaps', done)
  ], next);
};

const updateLocalRelations = (model, next) => {
  const ModuleInstance = getConnection('JISC_1_2_5').model('ModuleInstance');

  async.parallel([
    // this.module
    done => updateLocalSingular(ModuleInstance, model, {
      MOD_INSTANCE_ID: model.MOD_INSTANCE_ID,
      organisation: model.organisation
    }, 'moduleInstance', done)
  ], next);
};

schema.pre('save', function preSave(next) {
  const model = this;
  async.parallel([
    updateForeignRelations.bind(null, model),
    updateLocalRelations.bind(null, model)
  ], next);
});

schema.set('toObject', { virtuals: true });

export default getConnection('JISC_1_2_5').model('ModuleVleMap', schema, 'jiscModuleVleMaps');
