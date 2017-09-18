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
  STUDENT_COURSE_MEMBERSHIP_ID: { type: String, required: true, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  COURSE_INSTANCE_ID: { type: String, required: true, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  STUDENT_COURSE_MEMBERSHIP_SEQ: { type: String, required: true, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },

  STUDENT_ID: { type: String, required: true, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },

  MODE: { type: Number, min: 1, max: 99, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  YEAR_COM: { type: Number, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  YEAR_PRG: { type: Number, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  YEAR_STU: { type: Number, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  COURSE_LOCATION: { type: String, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  X_COURSE_AVERAGE_MARK: { type: Number, min: 0, max: 1, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  X_YEAR_AVERAGE_MARK: { type: Number, min: 0, max: 1, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },

  /**
   * Relations
   */
  student: { type: mongoose.Schema.ObjectId, ref: 'Student', readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  studentCourseMembership: { type: mongoose.Schema.ObjectId, ref: 'StudentCourseMembership', readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  courseInstance: { type: mongoose.Schema.ObjectId, ref: 'CourseInstance', readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  organisation: { type: mongoose.Schema.ObjectId, ref: 'Organisation' }
});
const baseScopes = [scopes.ALL, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP];
schema.readScopes = baseScopes.concat([scopes.UDD_READ]);
schema.writeScopes = baseScopes;

schema.index({ organisation: 1, STUDENT_COURSE_MEMBERSHIP_ID: 1, COURSE_INSTANCE_ID: 1, STUDENT_COURSE_MEMBERSHIP_SEQ: 1 }, { unique: true });

schema.plugin(timestamps, {
  createdAt: 'CREATED_AT',
  updatedAt: 'UPDATED_AT'
});
schema.plugin(softDeletePlugin, {
  flush: {
    keep: ['organisation', 'STUDENT_COURSE_MEMBERSHIP_ID']
  }
});
schema.plugin(filterByOrg);
schema.plugin(fieldScoping);
schema.plugin(scopeChecks);

const updateForeignRelations = (model, removeRelations, next) => {
  const Student = getConnection('JISC_1_2_7').model('Student');
  const StudentCourseMembership = getConnection('JISC_1_2_7').model('StudentCourseMembership');
  const CourseInstance = getConnection('JISC_1_2_7').model('CourseInstance');

  async.parallel([
    done => updateForeignMultiple(Student, model, removeRelations, {
      STUDENT_ID: model.STUDENT_ID,
      organisation: model.organisation
    }, 'studentCourseInstances', done),
    done => updateForeignMultiple(StudentCourseMembership, model, removeRelations, {
      STUDENT_COURSE_MEMBERSHIP_ID: model.STUDENT_COURSE_MEMBERSHIP_ID,
      organisation: model.organisation
    }, 'studentCourseInstances', done),
    done => updateForeignMultiple(CourseInstance, model, removeRelations, {
      COURSE_INSTANCE_ID: model.COURSE_INSTANCE_ID,
      organisation: model.organisation
    }, 'studentCourseInstances', done),

  ], next);
};

const updateLocalRelations = (model, next) => {
  const Student = getConnection('JISC_1_2_7').model('Student');
  const StudentCourseMembership = getConnection('JISC_1_2_7').model('StudentCourseMembership');
  const CourseInstance = getConnection('JISC_1_2_7').model('CourseInstance');

  async.parallel([
    done => updateLocalSingular(Student, model, {
      STUDENT_ID: model.STUDENT_ID,
      organisation: model.organisation
    }, 'student', done),
    done => updateLocalSingular(StudentCourseMembership, model, {
      STUDENT_COURSE_MEMBERSHIP_ID: model.STUDENT_COURSE_MEMBERSHIP_ID,
      organisation: model.organisation
    }, 'studentCourseMembership', done),
    done => updateLocalSingular(CourseInstance, model, {
      COURSE_INSTANCE_ID: model.COURSE_INSTANCE_ID,
      organisation: model.organisation
    }, 'courseInstance', done),
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

export default getConnection('JISC_1_2_7').model('StudentCourseInstance', schema, 'jiscStudentCourseInstances');
