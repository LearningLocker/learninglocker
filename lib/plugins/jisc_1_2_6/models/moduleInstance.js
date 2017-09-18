import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';
import timestamps from 'mongoose-timestamp';
import softDeletePlugin from 'lib/models/plugins/softDelete';
import filterByOrg from 'lib/models/plugins/filterByOrg';
import fieldScoping from 'lib/plugins/jisc_1_2_6/models/plugins/fieldScoping';
import scopeChecks from 'lib/models/plugins/scopeChecks';
import async from 'async';
import * as scopes from 'lib/constants/scopes';
import { updateForeignSingular,
         updateForeignMultiple,
         updateLocalSingular,
         updateLocalMultiple } from 'lib/plugins/jisc_1_2_6/utils/relations';

const schema = new mongoose.Schema({
  MOD_ID: { type: String, required: true, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP, scopes.OPENDASH] },
  MOD_INSTANCE_ID: { type: String, required: true, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP, scopes.OPENDASH] },
  MOD_PERIOD: { type: String, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP, scopes.OPENDASH] },
  MOD_ONLINE: { type: Number, required: true, min: 1, max: 2, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP, scopes.OPENDASH] },
  MOD_ACADEMIC_YEAR: { type: Number, required: true, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP, scopes.OPENDASH] },
  MOD_OPTIONAL: { type: Number, min: 1, max: 2, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP, scopes.OPENDASH] },
  MOD_LOCATION: { type: String, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP, scopes.OPENDASH] },

  /**
  * Relations
  */
  organisation: { type: mongoose.Schema.ObjectId, ref: 'Organisation' },
  module: { type: mongoose.Schema.ObjectId, ref: 'Module', readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP, scopes.OPENDASH] },
  moduleVleMaps: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ModuleVleMap' }], readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP, scopes.OPENDASH] },
  staffModuleInstances: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StaffModuleInstance' }], readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP, scopes.OPENDASH] },
  studentModuleInstances: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StudentModuleInstance' }], readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP, scopes.OPENDASH] },
  assessmentInstances: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AssessmentInstance' }], readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP, scopes.OPENDASH] },
  studentAssessmentInstances: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StudentAssessmentInstance' }], readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP, scopes.OPENDASH] },
});
schema.index({ organisation: 1, MOD_INSTANCE_ID: 1 }, { unique: true });
const baseScopes = [scopes.ALL, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP, scopes.OPENDASH];
schema.readScopes = baseScopes.concat([scopes.UDD_READ]);
schema.writeScopes = baseScopes;

schema.plugin(timestamps, {
  createdAt: 'CREATED_AT',
  updatedAt: 'UPDATED_AT'
});

schema.plugin(softDeletePlugin, {
  flush: {
    keep: ['organisation', 'MOD_INSTANCE_ID']
  }
});
schema.plugin(filterByOrg);
schema.plugin(fieldScoping);
schema.plugin(scopeChecks);

const updateForeignRelations = (model, removeRelations, next) => {
  const Module = getConnection('JISC_1_2_6').model('Module');
  const AssessmentInstance = getConnection('JISC_1_2_6').model('AssessmentInstance');
  const ModuleVleMap = getConnection('JISC_1_2_6').model('ModuleVleMap');
  const StaffModuleInstance = getConnection('JISC_1_2_6').model('StaffModuleInstance');
  const StudentAssessmentInstance = getConnection('JISC_1_2_6').model('StudentAssessmentInstance');
  const StudentModuleInstance = getConnection('JISC_1_2_6').model('StudentModuleInstance');

  const query = {
    MOD_INSTANCE_ID: model.MOD_INSTANCE_ID,
    organisation: model.organisation
  };

  async.parallel([
    // Module.moduleInstances
    done => updateForeignMultiple(Module, model, removeRelations, {
      MOD_ID: model.MOD_ID,
      organisation: model.organisation
    }, 'moduleInstances', done),
    // ModuleVleMap.moduleInstance
    done => updateForeignSingular(ModuleVleMap, model, removeRelations, query, 'moduleInstance', done),
    // StaffModuleInstance.moduleInstance
    done => updateForeignSingular(StaffModuleInstance, model, removeRelations, query, 'moduleInstance', done),
    // StudentModuleInstance.moduleInstance
    done => updateForeignSingular(StudentModuleInstance, model, removeRelations, query, 'moduleInstance', done),
    // StudentAssessmentInstance.moduleInstance
    done => updateForeignSingular(StudentAssessmentInstance, model, removeRelations, query, 'moduleInstance', done),
    // AssessmentInstance.moduleInstance
    done => updateForeignSingular(AssessmentInstance, model, removeRelations, query, 'moduleInstance', done),
  ], next);
};

const updateLocalRelations = (model, next) => {
  const Module = getConnection('JISC_1_2_6').model('Module');
  const AssessmentInstance = getConnection('JISC_1_2_6').model('AssessmentInstance');
  const ModuleVleMap = getConnection('JISC_1_2_6').model('ModuleVleMap');
  const StaffModuleInstance = getConnection('JISC_1_2_6').model('StaffModuleInstance');
  const StudentAssessmentInstance = getConnection('JISC_1_2_6').model('StudentAssessmentInstance');
  const StudentModuleInstance = getConnection('JISC_1_2_6').model('StudentModuleInstance');

  const query = {
    MOD_INSTANCE_ID: model.MOD_INSTANCE_ID,
    organisation: model.organisation
  };

  async.parallel([
    // this.module
    done => updateLocalSingular(Module, model, {
      MOD_ID: model.MOD_ID,
      organisation: model.organisation
    }, 'module', done),
    // this.moduleVleMaps
    done => updateLocalMultiple(ModuleVleMap, model, query, 'moduleVleMaps', done),
    // this.staffModuleInstances
    done => updateLocalMultiple(StaffModuleInstance, model, query, 'staffModuleInstances', done),
    // this.studentModuleInstances
    done => updateLocalMultiple(StudentModuleInstance, model, query, 'studentModuleInstances', done),
    // this.studentAssessmentInstances
    done => updateLocalMultiple(StudentAssessmentInstance, model, query, 'studentAssessmentInstances', done),
    // this.assessmentInstances
    done => updateLocalMultiple(AssessmentInstance, model, query, 'assessmentInstances', done),
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

export default getConnection('JISC_1_2_6').model('ModuleInstance', schema, 'jiscModuleInstances');
