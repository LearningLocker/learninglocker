import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';
import timestamps from 'mongoose-timestamp';
import softDeletePlugin from 'lib/models/plugins/softDelete';
import filterByOrg from 'lib/models/plugins/filterByOrg';
import fieldScoping from 'lib/plugins/jisc_1_2_4/models/plugins/fieldScoping';
import scopeChecks from 'lib/models/plugins/scopeChecks';
import async from 'async';
import * as scopes from 'lib/constants/scopes';
import { updateForeignMultiple,
         updateLocalSingular } from 'lib/plugins/jisc_1_2_4/utils/relations';

const schema = new mongoose.Schema({
  STUDENT_ID: { type: String, required: true, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.STUDENT_APP, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  STUDENT_COURSE_MEMBERSHIP_ID: { type: String, required: true, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.STUDENT_APP, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  STUDENT_COURSE_MEMBERSHIP_SEQ: { type: String, required: true, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.STUDENT_APP, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  MOD_INSTANCE_ID: { type: String, required: true, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.STUDENT_APP, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  ASSESS_INSTANCE_ID: { type: String, required: true, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.STUDENT_APP, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  ASSESS_SEQ_ID: { type: Number, required: true, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.STUDENT_APP, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  ASSESS_DUE_DATE: { type: Date, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.STUDENT_APP, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  ASSESS_RETAKE: { type: Number, min: 1, max: 2, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.STUDENT_APP, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  ASSESS_AGREED_MARK: { type: Number, min: 0, max: 100, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.STUDENT_APP, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  ASSESS_ACTUAL_MARK: { type: Number, min: 0, max: 100, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.STUDENT_APP, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  ASSESS_AGREED_GRADE: { type: String, required: true, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.STUDENT_APP, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  ASSESS_ACTUAL_GRADE: { type: String, required: true, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.STUDENT_APP, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  ASSESSMENT_CURRENT_ATTEMPT: { type: Number, required: true, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.STUDENT_APP, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  ASSESSMENT_RESULT: { type: Number, required: true, min: 1, max: 4, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.STUDENT_APP, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  GRADE_DATE: { type: Date, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.STUDENT_APP, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  MAX_POINTS: { type: String, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.STUDENT_APP, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  X_ASSESS_DETAIL: { type: String, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.STUDENT_APP, scopes.LAP, scopes.SSP] },
  X_MOD_NAME: { type: String, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.STUDENT_APP, scopes.LAP, scopes.SSP] },
  X_MOD_ID: { type: String, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.STUDENT_APP, scopes.LAP, scopes.SSP] },

  /**
  * Relations
  */
  student: { type: mongoose.Schema.ObjectId, ref: 'Student', readAccess: [scopes.ALL, scopes.UDD_READ, scopes.STUDENT_APP, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  studentCourseMembership: { type: mongoose.Schema.ObjectId, ref: 'StudentCourseMembership', readAccess: [scopes.ALL, scopes.UDD_READ, scopes.STUDENT_APP, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  assessmentInstance: { type: mongoose.Schema.ObjectId, ref: 'AssessmentInstance', readAccess: [scopes.ALL, scopes.UDD_READ, scopes.STUDENT_APP, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  moduleInstance: { type: mongoose.Schema.ObjectId, ref: 'ModuleInstance', readAccess: [scopes.ALL, scopes.UDD_READ, scopes.STUDENT_APP, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  organisation: { type: mongoose.Schema.ObjectId, ref: 'Organisation' },
});
const baseScopes = [scopes.ALL, scopes.STUDENT_APP, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP];
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
  const Student = getConnection('JISC_1_2_4').model('Student');
  const StudentCourseMembership = getConnection('JISC_1_2_4').model('StudentCourseMembership');
  const AssessmentInstance = getConnection('JISC_1_2_4').model('AssessmentInstance');
  const ModuleInstance = getConnection('JISC_1_2_4').model('ModuleInstance');

  async.parallel([
    done => updateForeignMultiple(Student, model, {
      STUDENT_ID: model.STUDENT_ID,
      organisation: model.organisation
    }, 'studentAssessmentInstances', done),
    done => updateForeignMultiple(StudentCourseMembership, model, {
      STUDENT_COURSE_MEMBERSHIP_ID: model.STUDENT_COURSE_MEMBERSHIP_ID,
      organisation: model.organisation
    }, 'studentAssessmentInstances', done),
    done => updateForeignMultiple(AssessmentInstance, model, {
      ASSESS_INSTANCE_ID: model.ASSESS_INSTANCE_ID,
      organisation: model.organisation
    }, 'studentAssessmentInstances', done),
    done => updateForeignMultiple(ModuleInstance, model, {
      MOD_INSTANCE_ID: model.MOD_INSTANCE_ID,
      organisation: model.organisation
    }, 'studentAssessmentInstances', done),
  ], next);
};

const updateLocalRelations = (model, next) => {
  const Student = getConnection('JISC_1_2_4').model('Student');
  const StudentCourseMembership = getConnection('JISC_1_2_4').model('StudentCourseMembership');
  const AssessmentInstance = getConnection('JISC_1_2_4').model('AssessmentInstance');
  const ModuleInstance = getConnection('JISC_1_2_4').model('ModuleInstance');

  async.parallel([
    done => updateLocalSingular(Student, model, {
      STUDENT_ID: model.STUDENT_ID,
      organisation: model.organisation
    }, 'student', done),
    done => updateLocalSingular(StudentCourseMembership, model, {
      STUDENT_COURSE_MEMBERSHIP_ID: model.STUDENT_COURSE_MEMBERSHIP_ID,
      organisation: model.organisation
    }, 'studentCourseMembership', done),
    done => updateLocalSingular(AssessmentInstance, model, {
      ASSESS_INSTANCE_ID: model.ASSESS_INSTANCE_ID,
      organisation: model.organisation
    }, 'assessmentInstance', done),
    done => updateLocalSingular(ModuleInstance, model, {
      MOD_INSTANCE_ID: model.MOD_INSTANCE_ID,
      organisation: model.organisation
    }, 'moduleInstance', done),
  ], next);
};

schema.pre('save', function preSave(next) {
  const model = this;
  async.parallel([
    updateForeignRelations.bind(null, model),
    updateLocalRelations.bind(null, model)
  ], next);
});

export default getConnection('JISC_1_2_4').model('StudentAssessmentInstance', schema, 'jiscStudentAssessmentInstances');
