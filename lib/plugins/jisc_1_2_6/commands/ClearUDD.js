import logger from 'lib/logger';
// import _ from 'lodash';
import Organisation from 'lib/models/organisation';

import AssessmentInstance from '../models/assessmentInstance';
import Course from '../models/course';
import CourseInstance from '../models/courseInstance';
import Institution from '../models/institution';
import Module from '../models/module';
import ModuleInstance from '../models/moduleInstance';
import ModuleVleMap from '../models/moduleVleMap';
import Staff from '../models/staff';
import StaffCourseInstance from '../models/staffCourseInstance';
import StaffModuleInstance from '../models/staffModuleInstance';
import Student from '../models/student';
import StudentAssessmentInstance from '../models/studentAssessmentInstance';
import StudentCourseInstance from '../models/studentCourseInstance';
import StudentCourseMembership from '../models/studentCourseMembership';
import StudentModuleInstance from '../models/studentModuleInstance';

const clearModel = orgId => (model) => {
  logger.info(`Clearing org's data from ${model.collection.name}`);
  return model.remove({ organisation: orgId }).exec().then(() => {
    logger.info(`${model.collection.name} cleared`);
  });
};

export default function (orgId) {
  if (!(orgId)) {
    logger.error('OrgId is required.');
    process.exit();
  }

  Organisation.findById(orgId, (err, org) => {
    if (err) throw new Error(err);
    if (!org) {
      logger.info('Organisation not found. Existing.');
      process.exit();
    }

    logger.info(`Organisation ${org.name} found. Clearing all UDD related data`);

    const clearOrgModel = clearModel(orgId);
    const exit = process.exit.bind(process);

    Promise.all([
      clearOrgModel(AssessmentInstance),
      clearOrgModel(Course),
      clearOrgModel(CourseInstance),
      clearOrgModel(Institution),
      clearOrgModel(Module),
      clearOrgModel(ModuleInstance),
      clearOrgModel(ModuleVleMap),
      clearOrgModel(Staff),
      clearOrgModel(StaffCourseInstance),
      clearOrgModel(StaffModuleInstance),
      clearOrgModel(Student),
      clearOrgModel(StudentAssessmentInstance),
      clearOrgModel(StudentCourseInstance),
      clearOrgModel(StudentCourseMembership),
      clearOrgModel(StudentModuleInstance),
    ]).then(() => {
      logger.info('All data cleared');
    }).then(exit, exit);
  });
}
