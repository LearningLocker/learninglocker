import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';
import timestamps from 'mongoose-timestamp';
import softDeletePlugin from 'lib/models/plugins/softDelete';
import filterByOrg from 'lib/models/plugins/filterByOrg';
import fieldScoping from 'lib/plugins/jisc_1_2_4/models/plugins/fieldScoping';
import scopeChecks from 'lib/models/plugins/scopeChecks';
import subjectCodes from 'lib/plugins/jisc_1_2_4/utils/subjectCodes';
import aimCodes from 'lib/plugins/jisc_1_2_4/utils/aimCodes';
import * as scopes from 'lib/constants/scopes';
import async from 'async';
import { updateForeignSingular,
         updateLocalSingular,
         updateForeignMultiple,
         updateLocalMultiple } from 'lib/plugins/jisc_1_2_4/utils/relations';

const schema = new mongoose.Schema({
  COURSE_ID: { type: String, required: true, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  SUBJECT: {
    type: String,
    required: true,
    enum: {
      values: subjectCodes,
      message: '`{PATH}`: `{VALUE}` is not a valid subject code. See https://www.hesa.ac.uk/index.php?option=com_studrec&task=show_file&mnl=14051&href=a%5E_%5EMODSBJ.html for information.'
    },
    readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  TITLE: { type: String, required: true, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  COURSE_AIM: {
    type: String,
    required: true,
    enum: {
      values: aimCodes,
      message: '`{PATH}`: `{VALUE}` is not a valid aim code. See https://www.hesa.ac.uk/index.php?option=com_studrec&task=show_file&mnl=14051&href=a%5E_%5ECOURSEAIM.html for information.'
    },
    readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  INST_TIER_1: { type: String, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  INST_TIER_2: { type: String, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  INST_TIER_3: { type: String, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  TENANT_ID: { type: String, maxLength: 8, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },

  /**
  * Relations
  */
  courseInstances: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CourseInstance' }], readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  studentCourseMemberships: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StudentCourseMembership' }], readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  organisation: { type: mongoose.Schema.ObjectId, ref: 'Organisation' },
  institution: { type: mongoose.Schema.ObjectId, ref: 'Institution' }
});
schema.index({ organisation: 1, COURSE_ID: 1 }, { unique: true });

const baseScopes = [scopes.ALL, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP];
schema.readScopes = baseScopes.concat([scopes.UDD_READ]);
schema.writeScopes = baseScopes;

schema.plugin(timestamps, {
  createdAt: 'CREATED_AT',
  updatedAt: 'UPDATED_AT'
});

schema.plugin(softDeletePlugin, {
  flush: {
    keep: ['organisation', 'COURSE_ID']
  }
});
schema.plugin(filterByOrg);
schema.plugin(fieldScoping);
schema.plugin(scopeChecks);

const updateForeignRelations = (model, next) => {
  const CourseInstance = getConnection('JISC_1_2_4').model('CourseInstance');
  const StudentCourseMembership = getConnection('JISC_1_2_4').model('StudentCourseMembership');
  const Institution = getConnection('JISC_1_2_4').model('Institution');

  const query = {
    COURSE_ID: model.COURSE_ID,
    organisation: model.organisation
  };

  async.parallel([
    // 'CourseInstance.course'
    done => updateForeignSingular(CourseInstance, model, query, 'course', done),

    // 'Institution.course'
    done => updateForeignSingular(StudentCourseMembership, model, query, 'course', done),

    // 'Institution.courses'
    done => updateForeignMultiple(Institution, model, {
      TENANT_ID: model.TENANT_ID,
      organisation: model.organisation
    }, 'courses', done)
  ], next);
};

const updateLocalRelations = (model, next) => {
  const CourseInstance = getConnection('JISC_1_2_4').model('CourseInstance');
  const StudentCourseMembership = getConnection('JISC_1_2_4').model('StudentCourseMembership');
  const Institution = getConnection('JISC_1_2_4').model('Institution');

  const query = {
    COURSE_ID: model.COURSE_ID,
    organisation: model.organisation
  };
  async.parallel([
    // this.courseInstances
    done => updateLocalMultiple(CourseInstance, model, query, 'courseInstances', done),

    // this.studentCourseMemberships
    done => updateLocalMultiple(StudentCourseMembership, model, query, 'studentCourseMemberships', done),

    // this.institution
    done => updateLocalSingular(Institution, model, query, 'institution', done),
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

export default getConnection('JISC_1_2_4').model('Course', schema, 'jiscCourses');
