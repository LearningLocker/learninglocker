import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';
import timestamps from 'mongoose-timestamp';
import filterByOrg from 'lib/models/plugins/filterByOrg';
import fieldScoping from 'lib/plugins/jisc_1_2_3/models/plugins/fieldScoping';
import scopeChecks from 'lib/models/plugins/scopeChecks';
import async from 'async';
import * as scopes from 'lib/constants/scopes';
import { updateForeignSingular,
         updateForeignMultiple,
         updateLocalSingular,
         updateLocalMultiple } from 'lib/plugins/jisc_1_2_3/utils/relations';

const schema = new mongoose.Schema({
  COURSE_ID: { type: String, required: true, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  COURSE_INSTANCE_ID: { type: String, required: true, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  START_DATE: { type: Date, required: true, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  END_DATE: { type: Date, required: true, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  ACADEMIC_YEAR: { type: Number, required: true, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },

  /**
   * Relations
   */
  course: { type: mongoose.Schema.ObjectId, ref: 'Course', readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  staffCourseInstances: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StaffCourseInstances' }], readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  studentModuleInstances: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StudentModuleInstances' }], readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  organisation: { type: mongoose.Schema.ObjectId, ref: 'Organisation' }
});
schema.index({ organisation: 1, COURSE_INSTANCE_ID: 1 }, { unique: true });
const baseScopes = [scopes.ALL, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP];
schema.readScopes = baseScopes.concat([scopes.UDD_READ]);
schema.writeScopes = baseScopes;

schema.plugin(timestamps, {
  createdAt: 'CREATED_AT',
  updatedAt: 'UPDATED_AT'
});
schema.plugin(filterByOrg);
schema.plugin(fieldScoping);
schema.plugin(scopeChecks);

const updateForeignRelations = (model, next) => {
  const Course = getConnection('JISC_1_2_3').model('Course');
  const StaffCourseInstance = getConnection('JISC_1_2_3').model('StaffCourseInstance');
  const StudentModuleInstance = getConnection('JISC_1_2_3').model('StudentModuleInstance');

  const query = {
    COURSE_INSTANCE_ID: model.COURSE_INSTANCE_ID,
    organisation: model.organisation
  };

  async.parallel([
    // 'Course.courseInstances'
    done => updateForeignMultiple(Course, model, {
      COURSE_ID: model.COURSE_ID,
      organisation: model.organisation
    }, 'courseInstances', done),

    // 'StaffCourseInstance.courseInstance'
    done => updateForeignSingular(StaffCourseInstance, model, query, 'courseInstance', done),

    // 'StudentModuleInstance.courseInstance'
    done => updateForeignSingular(StudentModuleInstance, model, query, 'courseInstance', done)
  ], next);
};

const updateLocalRelations = (model, next) => {
  const Course = getConnection('JISC_1_2_3').model('Course');
  const StaffCourseInstance = getConnection('JISC_1_2_3').model('StaffCourseInstance');
  const StudentModuleInstance = getConnection('JISC_1_2_3').model('StudentModuleInstance');

  const query = {
    COURSE_INSTANCE_ID: model.COURSE_INSTANCE_ID,
    organisation: model.organisation
  };

  async.parallel([
    // this.course
    done => updateLocalSingular(Course, model, {
      COURSE_ID: model.COURSE_ID,
      organisation: model.organisation
    }, 'course', done),

    // this.staffCourseInstances
    done => updateLocalMultiple(StaffCourseInstance, model, query, 'staffCourseInstances', done),

    // this.studentModuleInstances
    done => updateLocalMultiple(StudentModuleInstance, model, query, 'studentModuleInstances', done),
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

export default getConnection('JISC_1_2_3').model('CourseInstance', schema, 'jiscCourseInstances');
