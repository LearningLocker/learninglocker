import express from 'express';
import restify from 'express-restify-mongoose';
import { JISC_DEFAULTS } from 'lib/plugins/jisc_1_2_4/constants/auth';
import * as settings from 'lib/plugins/jisc_1_2_4/constants/settings';
import * as routes from 'lib/plugins/jisc_1_2_4/constants/routes';
import marked from 'marked';

// STUDENT DATA
import Student from 'lib/plugins/jisc_1_2_4/models/student';
import StudentCourseInstance from 'lib/plugins/jisc_1_2_4/models/studentCourseInstance';
import StudentModuleInstance from 'lib/plugins/jisc_1_2_4/models/studentModuleInstance';
import AssessmentInstance from 'lib/plugins/jisc_1_2_4/models/assessmentInstance';
import Course from 'lib/plugins/jisc_1_2_4/models/course';
import CourseInstance from 'lib/plugins/jisc_1_2_4/models/courseInstance';
import Module from 'lib/plugins/jisc_1_2_4/models/module';
import ModuleInstance from 'lib/plugins/jisc_1_2_4/models/moduleInstance';
import ModuleVleMap from 'lib/plugins/jisc_1_2_4/models/moduleVleMap';
import Institution from 'lib/plugins/jisc_1_2_4/models/institution';
import Staff from 'lib/plugins/jisc_1_2_4/models/staff';
import StaffCourseInstance from 'lib/plugins/jisc_1_2_4/models/staffCourseInstance';
import StaffModuleInstance from 'lib/plugins/jisc_1_2_4/models/staffModuleInstance';
import StudentAssessmentInstance from 'lib/plugins/jisc_1_2_4/models/studentAssessmentInstance';
import StudentCourseMembership from 'lib/plugins/jisc_1_2_4/models/studentCourseMembership';
import docs from 'lib/plugins/jisc_1_2_4/constants/docs/description.md';

const router = new express.Router();

const createRoutes = (version = null) => {
  if (version) {
    JISC_DEFAULTS.version = `/${version}`;
  }

  restify.defaults(JISC_DEFAULTS);

  router.get(`${routes.PREFIX}${JISC_DEFAULTS.version}`, (req, res) => {
    marked(docs, (err, content) => {
      res.status(200).send(content);
    });
  });

  router.get(`${routes.PREFIX}${JISC_DEFAULTS.version}/about`, (req, res) => {
    res.status(200).send({
      version: settings.VERSION
    });
  });

  restify.serve(router, Student, { ...settings.router, name: 'student' });
  restify.serve(router, StudentCourseInstance, { ...settings.router, name: 'studentcourseinstance' });
  restify.serve(router, StudentModuleInstance, { ...settings.router, name: 'studentmoduleinstance' });
  restify.serve(router, Course, { ...settings.router, name: 'course' });
  restify.serve(router, CourseInstance, { ...settings.router, name: 'courseinstance' });
  restify.serve(router, Module, { ...settings.router, name: 'module' });
  restify.serve(router, ModuleInstance, { ...settings.router, name: 'moduleinstance' });
  restify.serve(router, ModuleVleMap, { ...settings.router, name: 'modulevlemap' });
  restify.serve(router, Institution, { ...settings.router, name: 'institution' });
  restify.serve(router, AssessmentInstance, { ...settings.router, name: 'assessmentinstance' });
  restify.serve(router, Staff, { ...settings.router, name: 'staff' });
  restify.serve(router, StaffCourseInstance, { ...settings.router, name: 'staffcourseinstance' });
  restify.serve(router, StaffModuleInstance, { ...settings.router, name: 'staffmoduleinstance' });
  restify.serve(router, StudentAssessmentInstance, { ...settings.router, name: 'studentassessmentinstance' });
  restify.serve(router, StudentCourseMembership, { ...settings.router, name: 'studentcoursemembership' });

  return router;
};

export default createRoutes;
