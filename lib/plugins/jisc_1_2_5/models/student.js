import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';
import timestamps from 'mongoose-timestamp';
import filterByOrg from 'lib/models/plugins/filterByOrg';
import softDeletePlugin from 'lib/models/plugins/softDelete';
import fieldScoping from 'lib/plugins/jisc_1_2_5/models/plugins/fieldScoping';
import scopeChecks from 'lib/models/plugins/scopeChecks';
import domiciles from 'lib/plugins/jisc_1_2_5/utils/domiciles';
import ethnicityCodes from 'lib/plugins/jisc_1_2_5/utils/ethnicityCodes';
import * as scopes from 'lib/constants/scopes';
import async from 'async';
import { updateForeignSingular,
         updateForeignMultiple,
         updateLocalSingular,
         updateLocalMultiple } from 'lib/plugins/jisc_1_2_5/utils/relations';

const schema = new mongoose.Schema({
  STUDENT_ID: { type: String, required: true, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.STUDENT_APP, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP, scopes.OPENDASH] },
  ULN: { type: String, maxLength: 10, default: null, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  DOB: { type: Date, required: true, default: new Date('2099-12-31'), readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  ETHNICITY: {
    type: String,
    required: true,
    default: '90',
    enum: {
      values: ethnicityCodes,
      message: '`{PATH}`: `{VALUE}` is not a valid ethnicity code. See https://github.com/jiscdev/analytics-udd/blob/master/udd/student.md#valid-values--mappings for information.'
    },
    readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  SEXID: { type: Number, required: true, min: 1, max: 4, default: 4, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  LEARN_DIF: { type: Number, required: true, min: 1, max: 99, default: 99, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  DISABILITY1: { type: Number, required: true, min: 0, max: 99, default: 99, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  DISABILITY2: { type: Number, required: true, min: 0, max: 99, default: 99, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  DOMICILE: {
    type: String,
    required: true,
    maxLength: 2,
    default: 'ZZ',
    enum: {
      values: domiciles,
      message: '`{PATH}`: `{VALUE}` is not a valid domicile. See https://www.hesa.ac.uk/index.php?option=com_studrec&task=show_file&mnl=14051&href=a%5e_%5eDOMICILE.html for information.'
    },
    readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  TERMTIME_ACCOM: { type: Number, required: true, min: 1, max: 9, default: 5, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  PARENTS_ED: { type: Number, required: true, min: 1, max: 9, default: 8, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  SOCIO_EC: { type: Number, required: true, min: 1, max: 9, default: 9, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  OVERSEAS: { type: Number, required: true, default: 99, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },
  APPSHIB_ID: { type: String, maxLength: 256, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.STUDENT_APP, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP, scopes.OPENDASH] },
  VLE_ID: { type: String, maxLength: 256, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.STUDENT_APP, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP, scopes.OPENDASH] },
  HUS_ID: { type: String, maxLength: 13, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP] },

  // Additionals
  USERNAME: { type: String, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.STUDENT_APP, scopes.TRIBAL_INSIGHT, scopes.SSP, scopes.OPENDASH] },
  LAST_NAME: { type: String, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.STUDENT_APP, scopes.TRIBAL_INSIGHT, scopes.SSP, scopes.OPENDASH] },
  FIRST_NAME: { type: String, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.STUDENT_APP, scopes.TRIBAL_INSIGHT, scopes.SSP, scopes.OPENDASH] },
  ADDRESS_LINE_1: { type: String, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.SSP] },
  ADDRESS_LINE_2: { type: String, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.SSP] },
  ADDRESS_LINE_3: { type: String, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.SSP] },
  ADDRESS_LINE_4: { type: String, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.SSP] },
  POSTCODE: { type: String, maxLength: 8, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.SSP] },
  PRIMARY_EMAIL_ADDRESS: { type: String, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.SSP] },
  HOME_PHONE: { type: String, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.SSP] },
  MOBILE_PHONE: { type: String, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.SSP] },
  PHOTO_URL: { type: String, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.SSP, scopes.OPENDASH] },
  TUTOR_STAFF_ID: { type: String, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.TRIBAL_INSIGHT, scopes.SSP, scopes.OPENDASH] },
  ENTRY_POSTCODE: { type: String, maxLength: 8 },

  /**
  * Relations
  */
  studentAssessmentInstances: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StudentAssessmentInstance' }], readAccess: [scopes.ALL, scopes.UDD_READ, scopes.STUDENT_APP, scopes.TRIBAL_INSIGHT, scopes.SSP, scopes.OPENDASH] },
  studentCourseInstances: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StudentCourseInstance' }], readAccess: [scopes.ALL, scopes.UDD_READ, scopes.STUDENT_APP, scopes.TRIBAL_INSIGHT, scopes.SSP, scopes.OPENDASH] },
  studentCourseMemberships: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StudentCourseMembership' }], readAccess: [scopes.ALL, scopes.UDD_READ, scopes.STUDENT_APP, scopes.TRIBAL_INSIGHT, scopes.SSP, scopes.OPENDASH] },
  studentModuleInstances: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StudentModuleInstance' }], readAccess: [scopes.ALL, scopes.UDD_READ, scopes.STUDENT_APP, scopes.TRIBAL_INSIGHT, scopes.SSP, scopes.OPENDASH] },
  tutor: { type: mongoose.Schema.ObjectId, ref: 'Staff', readAccess: [scopes.ALL, scopes.UDD_READ, scopes.STUDENT_APP, scopes.TRIBAL_INSIGHT, scopes.SSP, scopes.OPENDASH] },
  organisation: { type: mongoose.Schema.ObjectId, ref: 'Organisation' },
});
schema.index({ organisation: 1, STUDENT_ID: 1 }, { unique: true });
const baseScopes = [scopes.ALL, scopes.STUDENT_APP, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP, scopes.OPENDASH];
schema.readScopes = baseScopes.concat([scopes.UDD_READ]);
schema.writeScopes = baseScopes;

schema.plugin(timestamps, {
  createdAt: 'CREATED_AT',
  updatedAt: 'UPDATED_AT'
});

schema.plugin(softDeletePlugin, {
  flush: {
    keep: ['organisation', 'STUDENT_ID']
  }
});
schema.plugin(filterByOrg);
schema.plugin(fieldScoping);
schema.plugin(scopeChecks);

const updateForeignRelations = (model, next) => {
  const StudentAssessmentInstance = getConnection('JISC_1_2_5').model('StudentAssessmentInstance');
  const StudentCourseInstance = getConnection('JISC_1_2_5').model('StudentCourseInstance');
  const StudentCourseMembership = getConnection('JISC_1_2_5').model('StudentCourseMembership');
  const StudentModuleInstance = getConnection('JISC_1_2_5').model('StudentModuleInstance');
  const Institution = getConnection('JISC_1_2_5').model('Institution');
  const Staff = getConnection('JISC_1_2_5').model('Staff');

  const query = {
    organisation: model.organisation,
    STUDENT_ID: model.STUDENT_ID
  };

  async.parallel([
    // 'StudentAssessmentInstance.student'
    done => updateForeignSingular(StudentAssessmentInstance, model, query, 'student', done),

    // 'StudentCourseInstance.student'
    done => updateForeignSingular(StudentCourseInstance, model, query, 'student', done),

    // 'StudentCourseMembership.student'
    done => updateForeignSingular(StudentCourseMembership, model, query, 'student', done),

    // 'StudentCourseMembership.student'
    done => updateForeignSingular(StudentCourseInstance, model, query, 'student', done),

    // 'StudentModuleInstance.student'
    done => updateForeignSingular(StudentModuleInstance, model, query, 'student', done),

    // 'Institution.students'
    done => updateForeignMultiple(Institution, model, {
      organisation: model.organisation
    }, 'students', done),

    // 'Staff.student'
    done => updateForeignMultiple(Staff, model, {
      organisation: model.organisation,
      STAFF_ID: model.TUTOR_STAFF_ID
    }, 'mentees', done),

  ], next);
};

const updateLocalRelations = (model, next) => {
  const StudentAssessmentInstance = getConnection('JISC_1_2_5').model('StudentAssessmentInstance');
  const StudentCourseInstance = getConnection('JISC_1_2_5').model('StudentCourseInstance');
  const StudentCourseMembership = getConnection('JISC_1_2_5').model('StudentCourseMembership');
  const StudentModuleInstance = getConnection('JISC_1_2_5').model('StudentModuleInstance');
  const Staff = getConnection('JISC_1_2_5').model('Staff');

  const query = {
    STUDENT_ID: model.STUDENT_ID,
    organisation: model.organisation
  };

  async.parallel([
    // this.assessmentInstances
    done => updateLocalMultiple(StudentAssessmentInstance, model, query, 'studentAssessmentInstances', done),

    // this.moduleInstances
    done => updateLocalMultiple(StudentModuleInstance, model, query, 'studentModuleInstances', done),

    // 'this.courseInstances'
    done => updateLocalMultiple(StudentCourseInstance, model, query, 'studentCourseInstances', done),

    // 'this.courseMemberships'
    done => updateLocalMultiple(StudentCourseMembership, model, query, 'studentCourseMemberships', done),

    // 'this.tutor'
    done => updateLocalSingular(Staff, model, {
      organisation: model.organisation,
      STAFF_ID: model.TUTOR_STAFF_ID
    }, 'tutor', done),
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

export default getConnection('JISC_1_2_5').model('Student', schema, 'jiscStudents');
