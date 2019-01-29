import logger from 'lib/logger';
import async from 'async';

import AssessmentInstance from 'lib/plugins/jisc_1_2_6/models/assessmentInstance';
import Course from 'lib/plugins/jisc_1_2_6/models/course';
import CourseInstance from 'lib/plugins/jisc_1_2_6/models/courseInstance';
import Institution from 'lib/plugins/jisc_1_2_6/models/institution';
import Module from 'lib/plugins/jisc_1_2_6/models/module';
import ModuleInstance from 'lib/plugins/jisc_1_2_6/models/moduleInstance';
import ModuleVleMap from 'lib/plugins/jisc_1_2_6/models/moduleVleMap';
import Staff from 'lib/plugins/jisc_1_2_6/models/staff';
import StaffCourseInstance from 'lib/plugins/jisc_1_2_6/models/staffCourseInstance';
import StaffModuleInstance from 'lib/plugins/jisc_1_2_6/models/staffModuleInstance';
import Student from 'lib/plugins/jisc_1_2_6/models/student';
import StudentAssessmentInstance from 'lib/plugins/jisc_1_2_6/models/studentAssessmentInstance';
import StudentCourseInstance from 'lib/plugins/jisc_1_2_6/models/studentCourseInstance';
import StudentCourseMembership from 'lib/plugins/jisc_1_2_6/models/studentCourseMembership';
import StudentModuleInstance from 'lib/plugins/jisc_1_2_6/models/studentModuleInstance';

const findAllModelsAndSave = (schema, cb) => {
  schema.find({}, (err, models) => {
    if (err) cb(err);
    async.map(
      models,
      (model, doneSaving) => model.save(doneSaving),
      cb
    );
  });
};

export default function () {
  logger.info('Updating relations...');

  async.series([
    async.apply(findAllModelsAndSave, AssessmentInstance),
    async.apply(findAllModelsAndSave, Course),
    async.apply(findAllModelsAndSave, CourseInstance),
    async.apply(findAllModelsAndSave, Institution),
    async.apply(findAllModelsAndSave, Module),
    async.apply(findAllModelsAndSave, ModuleInstance),
    async.apply(findAllModelsAndSave, ModuleVleMap),
    async.apply(findAllModelsAndSave, Staff),
    async.apply(findAllModelsAndSave, StaffCourseInstance),
    async.apply(findAllModelsAndSave, StaffModuleInstance),
    async.apply(findAllModelsAndSave, Student),
    async.apply(findAllModelsAndSave, StudentAssessmentInstance),
    async.apply(findAllModelsAndSave, StudentCourseInstance),
    async.apply(findAllModelsAndSave, StudentCourseMembership),
    async.apply(findAllModelsAndSave, StudentModuleInstance),
  ], (err) => {
    if (err) logger.error(err);
    else logger.info('All relations updated.');
    process.exit();
  });
}
