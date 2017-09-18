import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';
import timestamps from 'mongoose-timestamp';
import softDeletePlugin from 'lib/models/plugins/softDelete';
import filterByOrg from 'lib/models/plugins/filterByOrg';
import fieldScoping from 'lib/plugins/jisc_1_2_4/models/plugins/fieldScoping';
import scopeChecks from 'lib/models/plugins/scopeChecks';
import async from 'async';
import { updateForeignSingular, updateLocalMultiple } from 'lib/plugins/jisc_1_2_4/utils/relations';
import * as scopes from 'lib/constants/scopes';

const schema = new mongoose.Schema({
  TENANT_ID: { type: String, required: true, maxLength: 8, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.STUDENT_APP, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP, scopes.OPENDASH] },
  TENANT_NAME: { type: String, required: true, maxLength: 255, readAccess: [scopes.ALL, scopes.UDD_READ, scopes.STUDENT_APP, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP, scopes.OPENDASH] },

  /**
   * Relations
   */
  students: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }], readAccess: [scopes.ALL, scopes.UDD_READ, scopes.STUDENT_APP, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP, scopes.OPENDASH] },
  organisation: { type: mongoose.Schema.ObjectId, ref: 'Organisation' },
  courses: { type: mongoose.Schema.ObjectId, ref: 'Course' },
});
schema.index({ organisation: 1, TENANT_ID: 1 }, { unique: true });
const baseScopes = [scopes.ALL, scopes.STUDENT_APP, scopes.TRIBAL_INSIGHT, scopes.LAP, scopes.SSP, scopes.OPENDASH];
schema.readScopes = baseScopes.concat([scopes.UDD_READ]);
schema.writeScopes = baseScopes;

schema.plugin(timestamps, {
  createdAt: 'CREATED_AT',
  updatedAt: 'UPDATED_AT'
});

schema.plugin(softDeletePlugin, {
  flush: {
    keep: ['organisation', 'TENANT_ID']
  }
});
schema.plugin(filterByOrg);
schema.plugin(fieldScoping);
schema.plugin(scopeChecks);

const updateForeignRelations = (model, next) => {
  const Course = getConnection('JISC_1_2_4').model('Course');

  async.parallel([
    done => updateForeignSingular(Course, model, {
      TENANT_ID: model.TENANT_ID,
      organisation: model.organisation
    }, 'institution', done),
  ], next);
};

const updateLocalRelations = (model, next) => {
  const Student = getConnection('JISC_1_2_4').model('Student');
  const Course = getConnection('JISC_1_2_4').model('Course');

  async.parallel([
    // this.students
    done => updateLocalMultiple(Student, model, {
      organisation: model.organisation
    }, 'students', done),
    done => updateLocalMultiple(Course, model, {
      TENANT_ID: model.TENANT_ID,
      organisation: model.organisation
    }, 'courses', done),
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

export default getConnection('JISC_1_2_4').model('Institution', schema, 'jiscInstitutions');
