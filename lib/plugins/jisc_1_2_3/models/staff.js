import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';
import timestamps from 'mongoose-timestamp';
import filterByOrg from 'lib/models/plugins/filterByOrg';
import fieldScoping from 'lib/plugins/jisc_1_2_3/models/plugins/fieldScoping';
import scopeChecks from 'lib/models/plugins/scopeChecks';
import async from 'async';
import * as scopes from 'lib/constants/scopes';
import { updateForeignSingular,
         updateLocalMultiple } from 'lib/plugins/jisc_1_2_3/utils/relations';

const schema = new mongoose.Schema({
  STAFF_ID: { type: String, required: true, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.SSP, scopes.OPENDASH] },
  FIRST_NAME: { type: String, required: true, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.SSP, scopes.OPENDASH] },
  LAST_NAME: { type: String, required: true, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.SSP, scopes.OPENDASH] },
  TITLE: { type: String, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.SSP, scopes.OPENDASH] },
  PRIMARY_EMAIL_ADDRESS: { type: String, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.SSP, scopes.OPENDASH] },
  HESA_STAFF_ID: { type: String, maxLength: 13, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.SSP, scopes.OPENDASH] },
  DASH_SHIB_ID: { type: String, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.SSP, scopes.OPENDASH] },

  /**
  * Relations
  */
  staffCourseInstances: { type: [{ type: mongoose.Schema.ObjectId, ref: 'StaffCourseInstance' }], readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.SSP, scopes.OPENDASH] },
  mentees: { type: [{ type: mongoose.Schema.ObjectId, ref: 'Student' }], readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.SSP, scopes.OPENDASH] },
  staffModuleInstances: { type: [{ type: mongoose.Schema.ObjectId, ref: 'StaffModuleInstance' }], readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.SSP, scopes.OPENDASH] },
  organisation: { type: mongoose.Schema.ObjectId, ref: 'Organisation' },
});
schema.index({ organisation: 1, STAFF_ID: 1 }, { unique: true });
const baseScopes = [scopes.ALL, scopes.TRIBAL_INSIGHT, scopes.SSP, scopes.OPENDASH];
schema.readScopes = baseScopes.concat([scopes.UDD_READ]);
schema.writeScopes = baseScopes;

schema.plugin(timestamps, {
  createdAt: 'CREATED_AT',
  updatedAt: 'UPDATED_AT'
});
schema.plugin(filterByOrg);
schema.plugin(fieldScoping);
schema.plugin(scopeChecks);

schema.index({ organisation: 1, STAFF_ID: 1 }, { unique: true });

const updateForeignRelations = (model, next) => {
  const StaffCourseInstance = getConnection('JISC_1_2_3').model('StaffCourseInstance');
  const StaffModuleInstance = getConnection('JISC_1_2_3').model('StaffModuleInstance');
  const Student = getConnection('JISC_1_2_3').model('Student');

  const query = {
    organisation: model.organisation,
    STAFF_ID: model.STAFF_ID
  };

  async.parallel([
    // 'StaffCourseInstance.staff'
    done => updateForeignSingular(StaffCourseInstance, model, query, 'staff', done),

    // 'StaffModuleInstance.staff'
    done => updateForeignSingular(StaffModuleInstance, model, query, 'staff', done),

    // 'Student.tutor'
    done => updateForeignSingular(Student, model, {
      TUTOR_STAFF_ID: model.STAFF_ID,
      organisation: model.organisation
    }, 'tutor', done),

  ], next);
};

const updateLocalRelations = (model, next) => {
  const StaffCourseInstance = getConnection('JISC_1_2_3').model('StaffCourseInstance');
  const StaffModuleInstance = getConnection('JISC_1_2_3').model('StaffModuleInstance');
  const Student = getConnection('JISC_1_2_3').model('Student');

  const query = {
    STAFF_ID: model.STAFF_ID,
    organisation: model.organisation
  };

  async.parallel([
    // this.staffCourseInstances
    done => updateLocalMultiple(StaffCourseInstance, model, query, 'staffCourseInstances', done),

    // this.staffModuleInstances
    done => updateLocalMultiple(StaffModuleInstance, model, query, 'staffModuleInstances', done),

    // 'this.mentees'
    done => updateLocalMultiple(Student, model, {
      TUTOR_STAFF_ID: model.STAFF_ID,
      organisation: model.organisation
    }, 'mentees', done),

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
schema.set('toJSON', { virtuals: true });

export default getConnection('JISC_1_2_3').model('Staff', schema, 'jiscStaff');
