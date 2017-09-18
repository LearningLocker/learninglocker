import mongoose from 'mongoose';
import timestamps from 'mongoose-timestamp';
import { getConnection } from 'lib/connections/mongoose';
import softDeletePlugin from 'lib/models/plugins/softDelete';
import filterByOrg from 'lib/models/plugins/filterByOrg';
import fieldScoping from 'lib/plugins/jisc_1_2_7/models/plugins/fieldScoping';
import scopeChecks from 'lib/models/plugins/scopeChecks';
import async from 'async';
import * as scopes from 'lib/constants/scopes';
import { updateForeignMultiple,
         updateLocalSingular } from 'lib/plugins/jisc_1_2_7/utils/relations';

const schema = new mongoose.Schema({
  STAFF_ID: { type: String, required: true, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.SSP] },
  COURSE_INSTANCE_ID: { type: String, required: true, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.SSP] },

  /**
   * Relations
   */
  staff: { type: mongoose.Schema.ObjectId, ref: 'Staff', readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.SSP] },
  courseInstance: { type: mongoose.Schema.ObjectId, ref: 'CourseInstance', readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.SSP] },
  organisation: { type: mongoose.Schema.ObjectId, ref: 'Organisation' }
});
const baseScopes = [scopes.ALL, scopes.TRIBAL_INSIGHT, scopes.SSP];
schema.readScopes = baseScopes.concat([scopes.UDD_READ]);
schema.writeScopes = baseScopes;

schema.index({ organisation: 1, STAFF_ID: 1, COURSE_INSTANCE_ID: 1 }, { unique: true });

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

const updateForeignRelations = (model, removeRelations, next) => {
  const Staff = getConnection('JISC_1_2_7').model('Staff');
  const CourseInstance = getConnection('JISC_1_2_7').model('CourseInstance');

  async.parallel([
    // 'Staff.staffCourseInstances'
    done => updateForeignMultiple(Staff, model, removeRelations, {
      STAFF_ID: model.STAFF_ID,
      organisation: model.organisation
    }, 'staffCourseInstances', done),

    // 'CourseInstance.staffCourseInstances'
    done => updateForeignMultiple(CourseInstance, model, removeRelations, {
      COURSE_INSTANCE_ID: model.COURSE_INSTANCE_ID,
      organisation: model.organisation
    }, 'staffCourseInstances', done)
  ], next);
};

const updateLocalRelations = (model, next) => {
  const Staff = getConnection('JISC_1_2_7').model('Staff');
  const CourseInstance = getConnection('JISC_1_2_7').model('CourseInstance');

  async.parallel([
    // 'this.staff'
    done => updateLocalSingular(Staff, model, {
      STAFF_ID: model.STAFF_ID,
      organisation: model.organisation
    }, 'staff', done),

    // 'this.courseInstance'
    done => updateLocalSingular(CourseInstance, model, {
      COURSE_INSTANCE_ID: model.COURSE_INSTANCE_ID,
      organisation: model.organisation
    }, 'courseInstance', done)
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

export default getConnection('JISC_1_2_7').model('StaffCourseInstance', schema, 'jiscStaffCourseInstances');
