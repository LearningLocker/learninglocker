import Organisation from 'lib/models/organisation';
import Client from 'lib/models/client';
import faker from 'faker';
import _ from 'lodash';

import Student from 'lib/plugins/jisc_1_2_5/models/student';
import StudentModuleInstance
  from 'lib/plugins/jisc_1_2_5/models/studentModuleInstance';
import StudentCourseInstance
  from 'lib/plugins/jisc_1_2_5/models/studentCourseInstance';
import Course from 'lib/plugins/jisc_1_2_5/models/course';
import CourseInstance from 'lib/plugins/jisc_1_2_5/models/courseInstance';
import Module from 'lib/plugins/jisc_1_2_5/models/module';
import ModuleInstance from 'lib/plugins/jisc_1_2_5/models/moduleInstance';
import ModuleVleMap from 'lib/plugins/jisc_1_2_5/models/moduleVleMap';
import Institution from 'lib/plugins/jisc_1_2_5/models/institution';
import AssessmentInstance
  from 'lib/plugins/jisc_1_2_5/models/assessmentInstance';
import Staff from 'lib/plugins/jisc_1_2_5/models/staff';
import StaffCourseInstance
  from 'lib/plugins/jisc_1_2_5/models/staffCourseInstance';
import StaffModuleInstance
  from 'lib/plugins/jisc_1_2_5/models/staffModuleInstance';
import StudentAssessmentInstance
  from 'lib/plugins/jisc_1_2_5/models/studentAssessmentInstance';
import StudentCourseMembership
  from 'lib/plugins/jisc_1_2_5/models/studentCourseMembership';

import User from 'lib/models/user';
import subjectCodes from 'lib/plugins/jisc_1_2_5/utils/subjectCodes';
import aimCodes from 'lib/plugins/jisc_1_2_5/utils/aimCodes';
import entryQuals from 'lib/plugins/jisc_1_2_5/utils/entryQuals';
import * as scopes from 'lib/constants/scopes';

import moment from 'moment';

import async from 'async';

export default class JiscDBHelpers {
  studentId = 'student001';
  modInstanceId = 'modinstance001';
  courseId = 'course001';
  moduleId = 'module001';
  tenantId = 'tenant001';
  staffId = 'staff001';
  defaultId = '561a679c0c5d017e4004714f';
  secondaryId = '570f7b92246e03c82fa7518a';

  /**
   * Append a default _id and organisation to a set of data
   */
  addOrganistionData = (data, _id = this.defaultId) =>
    _.defaults(
      {
        _id,
        organisation: this.defaultId
      },
      data
    );

  /**
   * Remove all models from an array of schemas
   */
  cleanModels = (models, done) => {
    async.forEach(
      models,
      (model, doneDeleting) => {
        model.remove({}, doneDeleting);
      },
      done
    );
  };

  // GENERIC LL MODELS + STUDENT
  /**
   * Create a user, organisation and client with custom scopes
   * Continue only when all are inserted
   */
  prepareClient = (
    done,
    clientScopes = [scopes.ALL],
    readClientScopes = [scopes.UDD_READ]
  ) => {
    async.parallel(
      {
        organisation: insertDone =>
          Organisation.create(
            {
              _id: this.defaultId,
              name: 'Test organisation'
            },
            insertDone
          ),

        user: insertDone =>
          User.create(
            {
              _id: this.defaultId,
              email: 'testy@mctestface.com',
              password: 'password1',
              organisations: [this.defaultId]
            },
            insertDone
          ),

        client: insertDone =>
          Client.create(
            {
              _id: this.defaultId,
              organisation: this.defaultId,
              user: this.defaultId,
              scopes: clientScopes,
              title: 'New client'
            },
            insertDone
          ),

        readClient: insertDone =>
          Client.create(
            {
              organisation: this.defaultId,
              user: this.defaultId,
              scopes: readClientScopes,
              title: 'New UDD read client'
            },
            insertDone
          )
      },
      (err, results) => {
        this.organisation = results.organisation;
        this.user = results.user;
        this.client = results.client;
        this.readClient = results.readClient;
        done(err);
      }
    );
  };

  cleanUpClient = (done) => {
    this.cleanModels([Organisation, User, Client], done);
  };

  // STUDENT
  getStudentData = (studentId = this.studentId, tutorId = this.staffId) => ({
    STUDENT_ID: studentId,
    USERNAME: faker.internet.userName(),
    TUTOR_STAFF_ID: tutorId,
    FIRST_NAME: faker.name.firstName(),
    LAST_NAME: faker.name.lastName()
  });

  prepStudent = (done, data = this.getStudentData(), _id = this.defaultId) => {
    const studentData = this.addOrganistionData(data, _id);
    Student.create(studentData, (err, model) => {
      this.student = model;
      done(err, model);
    });
  };

  cleanStudent = (done) => {
    this.cleanModels([Student], done);
  };

  // STUDENT MODULE INSTANCES
  getStudentModuleInstanceData = (
    studentId = this.studentId,
    modInstanceId = this.modInstanceId
  ) => ({
    STUDENT_ID: studentId,
    USERNAME: faker.internet.userName(),
    MOD_INSTANCE_ID: modInstanceId,
    MOD_RESULT: 1,
    COURSE_INSTANCE_ID: this.courseId,
    STUDENT_COURSE_MEMBERSHIP_ID: this.defaultId,
    STUDENT_COURSE_MEMBERSHIP_SEQ: this.defaultId,
    MOD_GRADE: 'A',
    MOD_CREDITS_ACHIEVED: 'some',
    MOD_CURRENT_ATTEMPT: 'this one'
  });

  prepStudentModuleInstance = (
    done,
    data = this.getStudentModuleInstanceData()
  ) => {
    const studentModuleData = this.addOrganistionData(data);
    StudentModuleInstance.create(studentModuleData, (err, model) => {
      this.studentModuleInstance = model;
      done(err, model);
    });
  };

  cleanStudentModuleInstance = (done) => {
    this.cleanModels([StudentModuleInstance], done);
  };

  // STUDENT COURSE INSTANCES
  getStudentCourseInstanceData = (studentId = this.studentId) => ({
    STUDENT_ID: studentId,
    STUDENT_COURSE_MEMBERSHIP_ID: 'scm001',
    STUDENT_COURSE_MEMBERSHIP_SEQ: 2,
    COURSE_INSTANCE_ID: this.defaultId,
    MODE: 1,
    X_YEAR_AVERAGE_MARK: 0,
    X_COURSE_AVERAGE_MARK: 0,
    YEAR_STU: 0,
    YEAR_PRG: 0,
    YEAR_COM: 0
  });

  prepStudentCourseInstance = (
    done,
    data = this.getStudentCourseInstanceData()
  ) => {
    const studentCourseData = this.addOrganistionData(data);
    StudentCourseInstance.create(studentCourseData, (err, model) => {
      this.studentCourseInstance = model;
      done(err, model);
    });
  };

  cleanStudentCourseInstance = (done) => {
    this.cleanModels([StudentCourseInstance], done);
  };

  // COURSE
  getCourseData = (courseId = this.courseId) => ({
    COURSE_ID: courseId,
    TITLE: 'New course',
    SUBJECT: faker.random.arrayElement(subjectCodes),
    COURSE_AIM: faker.random.arrayElement(aimCodes),
    INST_TIER_1: 'tier1',
    INST_TIER_2: 'tier2',
    INST_TIER_3: 'tier3'
  });

  prepCourse = (done, data = this.getCourseData()) => {
    const courseData = this.addOrganistionData(data);
    Course.create(courseData, (err, model) => {
      this.course = model;
      done(err, model);
    });
  };

  cleanCourse = (done) => {
    this.cleanModels([Course], done);
  };

  // COURSE INSTANCE
  getCourseInstanceData = (courseId = this.courseId) => ({
    COURSE_INSTANCE_ID: this.defaultId,
    COURSE_ID: courseId,
    START_DATE: moment().subtract(3, 'months').format(),
    END_DATE: moment().add(1, 'year').format(),
    ACADEMIC_YEAR: 2016
  });

  prepCourseInstance = (done, data = this.getCourseInstanceData()) => {
    const courseInstanceData = this.addOrganistionData(data);
    CourseInstance.create(courseInstanceData, (err, model) => {
      this.courseInstance = model;
      done(err, model);
    });
  };

  cleanCourseInstance = (done) => {
    this.cleanModels([CourseInstance], done);
  };

  // MODULE
  getModuleData = (moduleId = this.moduleId) => ({
    MOD_ID: moduleId,
    MOD_NAME: 'New module',
    MOD_SUBJECT: faker.random.arrayElement(subjectCodes),
    MOD_CREDITS: 0
  });

  prepModule = (done, data = this.getModuleData()) => {
    const moduleData = this.addOrganistionData(data);
    Module.create(moduleData, (err, model) => {
      this.module = model;
      done(err, model);
    });
  };

  cleanModule = (done) => {
    this.cleanModels([Module], done);
  };

  // MODULE INSTANCE
  getModuleInstanceData = (
    moduleId = this.moduleId,
    modInstanceId = this.modInstanceId
  ) => ({
    MOD_INSTANCE_ID: modInstanceId,
    MOD_ID: moduleId,
    MOD_ONLINE: 1,
    MOD_OPTIONAL: 1,
    MOD_LOCATION: 'test',
    MOD_ACADEMIC_YEAR: 2016
  });

  prepModuleInstance = (done, data = this.getModuleInstanceData()) => {
    const moduleInstanceData = this.addOrganistionData(data);
    ModuleInstance.create(moduleInstanceData, (err, model) => {
      this.moduleInstance = model;
      done(err, model);
    });
  };

  cleanModuleInstance = (done) => {
    this.cleanModels([ModuleInstance], done);
  };

  // MODULE VLE MAP
  getModuleVleMapData = (modInstanceId = this.modInstanceId) => ({
    MOD_INSTANCE_ID: modInstanceId,
    VLE_MOD_ID: this.defaultId
  });

  prepModuleVleMap = (done, data = this.getModuleVleMapData()) => {
    const moduleVleMapData = this.addOrganistionData(data);
    ModuleVleMap.create(moduleVleMapData, (err, model) => {
      this.moduleVleMap = model;
      done(err, model);
    });
  };

  cleanModuleVleMap = (done) => {
    this.cleanModels([ModuleVleMap], done);
  };

  // INSTITUTION
  getInstitutionData = (tenantId = this.tenantId) => ({
    TENANT_ID: tenantId,
    TENANT_NAME: 'New institution'
  });

  prepInstitution = (done, data = this.getInstitutionData()) => {
    const institutionData = this.addOrganistionData(data);
    Institution.create(institutionData, (err, model) => {
      this.institution = model;
      done(err, model);
    });
  };

  cleanInstitution = (done) => {
    this.cleanModels([Institution], done);
  };

  // ASSESSMENT INSTANCE
  getAssessmentInstanceData = (modInstanceId = this.modInstanceId) => ({
    MOD_INSTANCE_ID: modInstanceId,
    ASSESS_INSTANCE_ID: this.defaultId,
    ASSESS_TYPE_ID: this.defaultId,
    ASSESS_TYPE_NAME: 'typename',
    ASSESS_DETAIL: 'detail',
    ASSESS_WEIGHT: 0
  });

  prepAssessmentInstance = (done, data = this.getAssessmentInstanceData()) => {
    const assessmentInstanceData = this.addOrganistionData(data);
    AssessmentInstance.create(assessmentInstanceData, (err, model) => {
      this.assessmentInstance = model;
      done(err, model);
    });
  };

  cleanAssessmentInstance = (done) => {
    this.cleanModels([AssessmentInstance], done);
  };

  // STAFF
  getStaffData = (staffId = this.staffId) => ({
    STAFF_ID: staffId,
    FIRST_NAME: faker.name.firstName(),
    LAST_NAME: faker.name.lastName(),
    PRIMARY_EMAIL_ADDRESS: faker.internet.email()
  });

  prepStaff = (done, data = this.getStaffData()) => {
    const staffData = this.addOrganistionData(data);
    Staff.create(staffData, (err, model) => {
      this.staff = model;
      done(err, model);
    });
  };

  cleanStaff = (done) => {
    this.cleanModels([Staff], done);
  };

  // STAFF COURSE INSTANCE
  getStaffCourseInstanceData = (staffId = this.staffId) => ({
    STAFF_ID: staffId,
    COURSE_INSTANCE_ID: this.defaultId
  });

  prepStaffCourseInstance = (
    done,
    data = this.getStaffCourseInstanceData()
  ) => {
    const staffCourseInstanceData = this.addOrganistionData(data);
    StaffCourseInstance.create(staffCourseInstanceData, (err, model) => {
      this.staffCourseInstance = model;
      done(err, model);
    });
  };

  cleanStaffCourseInstance = (done) => {
    this.cleanModels([StaffCourseInstance], done);
  };

  // STAFF MODULE INSTANCE
  getStaffModuleInstanceData = (
    staffId = this.staffId,
    modInstanceId = this.modInstanceId
  ) => ({
    STAFF_ID: staffId,
    MOD_INSTANCE_ID: modInstanceId
  });

  prepStaffModuleInstance = (
    done,
    data = this.getStaffModuleInstanceData()
  ) => {
    const staffModuleInstanceData = this.addOrganistionData(data);
    StaffModuleInstance.create(staffModuleInstanceData, (err, model) => {
      this.staffModuleInstance = model;
      done(err, model);
    });
  };

  cleanStaffModuleInstance = (done) => {
    this.cleanModels([StaffModuleInstance], done);
  };

  // STUDENT ASSESSMENT INSTANCE
  getStudentAssessmentInstanceData = (
    studentId = this.studentId,
    modInstanceId = this.modInstanceId
  ) => ({
    STUDENT_ID: studentId,
    STUDENT_COURSE_MEMBERSHIP_ID: this.defaultId,
    STUDENT_COURSE_MEMBERSHIP_SEQ: this.defaultId,
    ASSESSMENT_RESULT: 1,
    ASSESSMENT_CURRENT_ATTEMPT: 1,
    ASSESS_ACTUAL_GRADE: 'A',
    ASSESS_AGREED_GRADE: 'A',
    ASSESS_SEQ_ID: 1,
    MOD_INSTANCE_ID: modInstanceId,
    ASSESS_INSTANCE_ID: this.defaultId
  });

  prepStudentAssessmentInstance = (
    done,
    data = this.getStudentAssessmentInstanceData()
  ) => {
    const studentAssessmentInstanceData = this.addOrganistionData(data);
    StudentAssessmentInstance.create(
      studentAssessmentInstanceData,
      (err, model) => {
        this.studentAssessmentInstance = model;
        done(err, model);
      }
    );
  };

  cleanStudentAssessmentInstance = (done) => {
    this.cleanModels([StudentAssessmentInstance], done);
  };

  // STUDENT COURESE MEMEBERSHIP
  getStudentCourseMembershipData = (
    studentId = this.studentId,
    courseId = this.courseId
  ) => ({
    STUDENT_ID: studentId,
    COURSE_ID: courseId,
    STUDENT_COURSE_MEMBERSHIP_ID: this.defaultId,
    STUDENT_COURSE_MEMBERSHIP_SEQ: this.defaultId,
    COURSE_END_DATE: moment().subtract(3, 'months').format(),
    COURSE_EXPECTED_END_DATE: moment().subtract(3, 'months').format(),
    COURSE_MARK: 1,
    COURSE_GRADE: 1,
    COURSE_OUTCOME: 1,
    ENTRY_QUALS: faker.random.arrayElement(entryQuals),
    WITHDRAWAL_REASON: 99,
    COURSE_AIM_ATTAINED: faker.random.arrayElement(aimCodes)
  });

  prepStudentCourseMembership = (
    done,
    data = this.getStudentCourseMembershipData()
  ) => {
    const studentCourseMembershipData = this.addOrganistionData(data);
    StudentCourseMembership.create(
      studentCourseMembershipData,
      (err, model) => {
        this.studentCourseMembership = model;
        done(err, model);
      }
    );
  };

  cleanStudentCourseMembership = (done) => {
    this.cleanModels([StudentCourseMembership], done);
  };
}
