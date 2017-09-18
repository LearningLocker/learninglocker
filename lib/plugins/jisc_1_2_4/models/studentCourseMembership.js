import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';
import timestamps from 'mongoose-timestamp';
import softDeletePlugin from 'lib/models/plugins/softDelete';
import filterByOrg from 'lib/models/plugins/filterByOrg';
import fieldScoping from 'lib/plugins/jisc_1_2_4/models/plugins/fieldScoping';
import scopeChecks from 'lib/models/plugins/scopeChecks';
import entryQuals from 'lib/plugins/jisc_1_2_4/utils/entryQuals';
import aimCodes from 'lib/plugins/jisc_1_2_4/utils/aimCodes';
import async from 'async';
import * as scopes from 'lib/constants/scopes';
import { updateForeignMultiple,
         updateLocalSingular } from 'lib/plugins/jisc_1_2_4/utils/relations';

const schema = new mongoose.Schema({
  STUDENT_ID: { type: String, required: true, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  STUDENT_COURSE_MEMBERSHIP_ID: { type: String, required: true, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  STUDENT_COURSE_MEMBERSHIP_SEQ: { type: String, required: true, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  COURSE_ID: { type: String, required: true, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  WITHDRAWAL_REASON: { type: Number, min: 2, max: 99, default: 99, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  WITHDRAWAL_DATE: { type: Date, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  ENTRY_QUALS: {
    type: String,
    required: true,
    enum: {
      values: entryQuals,
      message: '`{PATH}`: `{VALUE}` is not a valid entry qualification. See https://github.com/jiscdev/analytics-udd/blob/master/udd/student_course_membership.md#entry_quals for information.'
    },
    readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  ENTRY_POINTS: { type: Number, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  COURSE_OUTCOME: { type: Number, required: true, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  COURSE_GRADE: { type: Number, required: true, min: 1, max: 91, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  COURSE_AIM_ATTAINED: {
    type: String,
    enum: {
      values: aimCodes,
      message: '`{PATH}`: `{VALUE}` is not a valid aim code. See https://www.hesa.ac.uk/index.php?option=com_studrec&task=show_file&mnl=14051&href=a%5E_%5ECOURSEAIM.html for information.'
    },
    readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  COURSE_MARK: { type: Number, required: true, min: 0, max: 100, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  COURSE_EXPECTED_END_DATE: { type: Date, required: true, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  COURSE_END_DATE: { type: Date, required: true, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  COURSE_JOIN_DATE: { type: Date, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  COURSE_JOIN_AGE: { type: Date, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  COHORT_ID: { type: String, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },

  /**
  * Relations
  */
  student: { type: mongoose.Schema.ObjectId, ref: 'Student', readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  course: { type: mongoose.Schema.ObjectId, ref: 'Course', readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  organisation: { type: mongoose.Schema.ObjectId, ref: 'Organisation' }
});
schema.index({ organisation: 1, STUDENT_COURSE_MEMBERSHIP_ID: 1 }, { unique: true });
const baseScopes = [scopes.ALL, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP];
schema.readScopes = baseScopes.concat([scopes.UDD_READ]);
schema.writeScopes = baseScopes;

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

const updateForeignRelations = (model, next) => {
  const Student = getConnection('JISC_1_2_4').model('Student');
  const Course = getConnection('JISC_1_2_4').model('Course');

  async.parallel([
    done => updateForeignMultiple(Student, model, {
      STUDENT_ID: model.STUDENT_ID,
      organisation: model.organisation
    }, 'studentCourseMemberships', done),
    done => updateForeignMultiple(Course, model, {
      COURSE_ID: model.COURSE_ID,
      organisation: model.organisation
    }, 'studentCourseMemberships', done),
  ], next);
};

const updateLocalRelations = (model, next) => {
  const Student = getConnection('JISC_1_2_4').model('Student');
  const Course = getConnection('JISC_1_2_4').model('Course');

  async.parallel([
    done => updateLocalSingular(Student, model, {
      STUDENT_ID: model.STUDENT_ID,
      organisation: model.organisation
    }, 'student', done),
    done => updateLocalSingular(Course, model, {
      COURSE_ID: model.COURSE_ID,
      organisation: model.organisation
    }, 'course', done),
  ], next);
};

schema.pre('save', function preSave(next) {
  const model = this;
  async.parallel([
    updateForeignRelations.bind(null, model),
    updateLocalRelations.bind(null, model)
  ], next);
});

export default getConnection('JISC_1_2_4').model('StudentCourseMembership', schema, 'jiscStudentCourseMemberships');
