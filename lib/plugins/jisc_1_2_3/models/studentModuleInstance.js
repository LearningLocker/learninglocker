import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';
import timestamps from 'mongoose-timestamp';
import filterByOrg from 'lib/models/plugins/filterByOrg';
import fieldScoping from 'lib/plugins/jisc_1_2_3/models/plugins/fieldScoping';
import scopeChecks from 'lib/models/plugins/scopeChecks';
import async from 'async';
import * as scopes from 'lib/constants/scopes';
import { updateForeignMultiple,
         updateLocalSingular } from 'lib/plugins/jisc_1_2_3/utils/relations';

const schema = new mongoose.Schema({
  STUDENT_ID: { type: String, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.STUDENT_APP, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP, scopes.OPENDASH] },
  STUDENT_COURSE_MEMBERSHIP_ID: { type: String, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP, scopes.OPENDASH] },
  STUDENT_COURSE_MEMBERSHIP_SEQ: { type: String, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP, scopes.OPENDASH] },
  COURSE_INSTANCE_ID: { type: String, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  MOD_INSTANCE_ID: { type: String, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.STUDENT_APP, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP, scopes.OPENDASH] },
  MOD_RESULT: { type: Number, min: 1, max: 4, required: true, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP, scopes.OPENDASH] },
  MOD_RETAKE: { type: Number, min: 1, max: 2, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP, scopes.OPENDASH] },
  MOD_START_DATE: { type: Date, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP, scopes.OPENDASH] },
  MOD_END_DATE: { type: Date, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP, scopes.OPENDASH] },
  MOD_FIRST_MARK: { type: Number, min: 1, max: 100, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  MOD_ACTUAL_MARK: { type: Number, min: 1, max: 100, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  MOD_AGREED_MARK: { type: Number, min: 1, max: 100, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  MOD_FIRST_GRADE: { type: String, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  MOD_ACTUAL_GRADE: { type: String, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  MOD_AGREED_GRADE: { type: String, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  MOD_CREDITS_ACHIEVED: { type: String, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  MOD_CURRENT_ATTEMPT: { type: String, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  MOD_COMPLETED_ATTEMPT: { type: String, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  X_MOD_NAME: { type: String, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.STUDENT_APP, scopes.LAP, scopes.OPENDASH] },

  /**
  * Relations
  */
  student: { type: mongoose.Schema.ObjectId, ref: 'Student', readAccess: [scopes.ALL, scopes.UDD_READ, scopes.STUDENT_APP, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP, scopes.OPENDASH] },
  moduleInstance: { type: mongoose.Schema.ObjectId, ref: 'ModuleInstance', readAccess: [scopes.ALL, scopes.UDD_READ, scopes.STUDENT_APP, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP, scopes.OPENDASH] },
  courseInstance: { type: mongoose.Schema.ObjectId, ref: 'CourseInstance', readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  studentCourseMembership: { type: mongoose.Schema.ObjectId, ref: 'StudentCourseMembership', readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  organisation: { type: mongoose.Schema.ObjectId, ref: 'Organisation' }
});
const baseScopes = [scopes.ALL, scopes.STUDENT_APP, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP, scopes.OPENDASH];
schema.readScopes = baseScopes.concat([scopes.UDD_READ]);
schema.writeScopes = baseScopes;

schema.plugin(timestamps, {
  createdAt: 'CREATED_AT',
  updatedAt: 'UPDATED_AT'
});
schema.plugin(filterByOrg);
schema.plugin(fieldScoping);
schema.plugin(scopeChecks);

const updateLocalRelations = (model, next) => {
  const Student = getConnection('JISC_1_2_3').model('Student');
  const ModuleInstance = getConnection('JISC_1_2_3').model('ModuleInstance');
  const CourseInstance = getConnection('JISC_1_2_3').model('CourseInstance');
  const StudentCourseMembership = getConnection('JISC_1_2_3').model('StudentCourseMembership');

  async.parallel([
    done => updateLocalSingular(Student, model, {
      STUDENT_ID: model.STUDENT_ID,
      organisation: model.organisation
    }, 'student', done),
    done => updateLocalSingular(ModuleInstance, model, {
      MOD_INSTANCE_ID: model.MOD_INSTANCE_ID,
      organisation: model.organisation
    }, 'moduleInstance', done),
    done => updateLocalSingular(CourseInstance, model, {
      COURSE_INSTANCE_ID: model.COURSE_INSTANCE_ID,
      organisation: model.organisation
    }, 'courseInstance', done),
    done => updateLocalSingular(StudentCourseMembership, model, {
      STUDENT_COURSE_MEMBERSHIP_ID: model.STUDENT_COURSE_MEMBERSHIP_ID,
      organisation: model.organisation
    }, 'studentCourseMembership', done),
  ], next);
};

const updateForeignRelations = (model, next) => {
  const Student = getConnection('JISC_1_2_3').model('Student');
  const ModuleInstance = getConnection('JISC_1_2_3').model('ModuleInstance');
  const CourseInstance = getConnection('JISC_1_2_3').model('CourseInstance');
  const StudentCourseMembership = getConnection('JISC_1_2_3').model('StudentCourseMembership');

  async.parallel([
    done => updateForeignMultiple(Student, model, {
      STUDENT_ID: model.STUDENT_ID,
      organisation: model.organisation
    }, 'studentModuleInstances', done),
    done => updateForeignMultiple(ModuleInstance, model, {
      MOD_INSTANCE_ID: model.MOD_INSTANCE_ID,
      organisation: model.organisation
    }, 'studentModuleInstances', done),
    done => updateForeignMultiple(CourseInstance, model, {
      COURSE_INSTANCE_ID: model.COURSE_INSTANCE_ID,
      organisation: model.organisation
    }, 'studentModuleInstances', done),
    done => updateForeignMultiple(StudentCourseMembership, model, {
      STUDENT_COURSE_MEMBERSHIP_ID: model.STUDENT_COURSE_MEMBERSHIP_ID,
      organisation: model.organisation
    }, 'studentModuleInstances', done),
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

export default getConnection('JISC_1_2_3').model('StudentModuleInstance', schema, 'jiscStudentModuleInstances');
