import supertestApi from 'lib/connections/supertestApi';
import { getConnection } from 'lib/connections/mongoose';
import { VERSION } from 'lib/plugins/jisc_1_2_7/constants/settings';
import DBHelper from 'lib/plugins/jisc_1_2_7/utils/TestDBHelper';
import { RESTIFY_ROOT } from './constants';

const db = new DBHelper();

const apiApp = supertestApi();

const testREST = (
  name,
  baseurl,
  d,
  postOptions = { data: {}, test: () => {} },
  patchOptions = { data: {}, test: () => {} }
) => {
  const id = d.defaultId;

  describe(`GET ${baseurl}`, () => {
    it(`should get all (only 1) ${name}s and return 200`, (done) => {
      apiApp
        .get(baseurl)
        .auth(d.client.api.basic_key, d.client.api.basic_secret)
        .send()
        .expect((res) => {
          if (res.body.length !== 1) {
            throw new Error(
              `Only 1 model expected, ${res.body.length} returned`
            );
          }
        })
        .expect(200, done);
    });
  });

  describe(`GET ${baseurl}/${id}`, () => {
    it(`should get ${name} with id ${id} and return 200`, (done) => {
      apiApp
        .get(`${baseurl}/${id}`)
        .auth(d.client.api.basic_key, d.client.api.basic_secret)
        .send()
        .expect((res) => {
          if (!('_id' in res.body)) {
            throw new Error('Model not found');
          }
          if (res.body._id !== id) throw new Error('Wrong user returned');
        })
        .expect(200, done);
    });
  });

  describe(`GET ${baseurl}`, () => {
    it(`should get all (only 1) ${name}s and return 200 when using read client`, (done) => {
      apiApp
        .get(baseurl)
        .auth(d.readClient.api.basic_key, d.readClient.api.basic_secret)
        .send()
        .expect((res) => {
          if (res.body.length !== 1) {
            throw new Error(
              `Only 1 model expected, ${res.body.length} returned`
            );
          }
        })
        .expect(200, done);
    });
  });

  describe(`GET ${baseurl}/${id}`, () => {
    it(`should get ${name} with id ${id} and return 200 when using read client`, (done) => {
      apiApp
        .get(`${baseurl}/${id}`)
        .auth(d.readClient.api.basic_key, d.readClient.api.basic_secret)
        .send()
        .expect((res) => {
          if (!('_id' in res.body)) {
            throw new Error('Model not found');
          }
          if (res.body._id !== id) throw new Error('Wrong user returned');
        })
        .expect(200, done);
    });
  });

  describe(`POST ${baseurl}`, () => {
    it(`should insert a ${name}, return the full new model and return 201`, (done) => {
      apiApp
        .post(`${baseurl}`)
        .auth(d.client.api.basic_key, d.client.api.basic_secret)
        .send(postOptions.data)
        .expect(postOptions.test)
        .expect(201, done);
    });
  });

  describe(`POST ${baseurl}`, () => {
    it('should attempt to throw 403 with read only client', (done) => {
      apiApp
        .post(`${baseurl}`)
        .auth(d.readClient.api.basic_key, d.readClient.api.basic_secret)
        .send(postOptions.data)
        .expect(403, done);
    });
  });

  describe(`PATCH ${baseurl}/${id}`, () => {
    it(`should patch a ${name}, return the updated model and return 200`, (done) => {
      apiApp
        .patch(`${baseurl}/${id}`)
        .auth(d.client.api.basic_key, d.client.api.basic_secret)
        .send(patchOptions.data)
        .expect(patchOptions.test)
        .expect(200, done);
    });
  });

  describe(`PATCH ${baseurl}/${id}`, () => {
    it('should attempt to throw 403 with read only client', (done) => {
      apiApp
        .patch(`${baseurl}/${id}`)
        .auth(d.readClient.api.basic_key, d.readClient.api.basic_secret)
        .send(patchOptions.data)
        .expect(403, done);
    });
  });

  describe(`DELETE ${baseurl}/${id}`, () => {
    it(`should delete a ${name} and return 204`, (done) => {
      apiApp
        .delete(`${baseurl}/${id}`)
        .auth(d.client.api.basic_key, d.client.api.basic_secret)
        .send()
        .expect(204, done);
    });
  });

  describe(`DELETE ${baseurl}/${id}`, () => {
    it('should attempt to throw 403 with read only client', (done) => {
      apiApp
        .delete(`${baseurl}/${id}`)
        .auth(d.readClient.api.basic_key, d.readClient.api.basic_secret)
        .send()
        .expect(403, done);
    });
  });
};

describe('JISC REST API tests', () => {
  before((done) => {
    const connection = getConnection('JISC_1_2_7');
    if (connection.readyState !== 1) {
      connection.on('connected', done);
    } else {
      done();
    }
  });

  beforeEach('Set up client for testing', (done) => {
    db.prepareClient(done);
  });

  afterEach('Clear client', (done) => {
    db.cleanUpClient(done);
  });

  describe(`GET ${RESTIFY_ROOT}`, () => {
    it(`should return the plugins current version (${VERSION})`, (done) => {
      apiApp.get(RESTIFY_ROOT).expect(200).end(done);
    });
  });

  describe('Test Student API', () => {
    const endpoint = `${RESTIFY_ROOT}/student`;

    beforeEach('Setup Student Module Instances', (beforeDone) => {
      db.prepStudent(beforeDone);
    });
    afterEach('Remove Student Module Instances', (afterDone) => {
      db.cleanStudent(afterDone);
    });

    const postData = db.getStudentData('student002');
    const patchData = {
      LAST_NAME: 'NewLastName'
    };

    describe(
      'REST tests',
      testREST.bind(
        null,
        'student',
        endpoint,
        db,
        {
          data: postData,
          test: (res) => {
            if (res.body.STUDENT_ID !== postData.STUDENT_ID) {
              throw new Error('New model did not have the expected STUDENT_ID');
            }
          }
        },
        {
          data: patchData,
          test: (res) => {
            if (res.body.LAST_NAME !== patchData.LAST_NAME) {
              throw new Error(
                'Patched model did not have the expected LAST_NAME'
              );
            }
          }
        }
      )
    );
  });

  describe('Test Student Module Instances API', () => {
    const endpoint = `${RESTIFY_ROOT}/studentModuleInstance`;
    beforeEach('Setup Student Module Instances', (beforeDone) => {
      db.prepStudentModuleInstance(beforeDone);
    });
    afterEach('Remove Student Module Instances', (afterDone) => {
      db.cleanStudentModuleInstance(afterDone);
    });

    const postData = db.getStudentModuleInstanceData(
      db.studentId,
      'modInstance002'
    );
    const patchData = {
      MOD_RESULT: postData.MOD_RESULT + 1
    };

    describe(
      'REST tests',
      testREST.bind(
        null,
        'student module instance',
        endpoint,
        db,
        {
          data: postData,
          test: (res) => {
            if (res.body.STUDENT_ID !== postData.STUDENT_ID) {
              throw new Error('New model did not have the expected STUDENT_ID');
            }
          }
        },
        {
          data: patchData,
          test: (res) => {
            if (res.body.MOD_RESULT !== patchData.MOD_RESULT) {
              throw new Error(
                'Patched model did not have the expected MOD_RESULT'
              );
            }
          }
        }
      )
    );
  });

  describe('Test Student Course Instances API', () => {
    const endpoint = `${RESTIFY_ROOT}/studentCourseInstance`;
    beforeEach('Setup Student Course Instances', (beforeDone) => {
      db.prepStudentCourseInstance(beforeDone);
    });
    afterEach('Remove Student Course Instances', (afterDone) => {
      db.cleanStudentCourseInstance(afterDone);
    });

    const postData = db.getStudentCourseInstanceData();
    postData.STUDENT_COURSE_MEMBERSHIP_ID = 'scm002';
    const patchData = {
      MODE: postData.MODE + 1
    };

    describe(
      'REST tests',
      testREST.bind(
        null,
        'student course instance',
        endpoint,
        db,
        {
          data: postData,
          test: (res) => {
            if (
              res.body.STUDENT_COURSE_MEMBERSHIP_ID !==
              postData.STUDENT_COURSE_MEMBERSHIP_ID
            ) {
              throw new Error(
                'New model did not have the expected STUDENT_COURSE_MEMBERSHIP_ID'
              );
            }
          }
        },
        {
          data: patchData,
          test: (res) => {
            if (res.body.MODE !== patchData.MODE) {
              throw new Error(
                'Patched model did not have the expected LAST_NAME'
              );
            }
          }
        }
      )
    );
  });

  describe('Test Course API', () => {
    const endpoint = `${RESTIFY_ROOT}/course`;
    beforeEach('Setup Course', (beforeDone) => {
      db.prepCourse(beforeDone);
    });
    afterEach('Remove Course', (afterDone) => {
      db.cleanCourse(afterDone);
    });

    const postData = db.getCourseData('course002');
    const patchData = {
      TITLE: 'Updated title'
    };

    describe(
      'REST tests',
      testREST.bind(
        null,
        'course',
        endpoint,
        db,
        {
          data: postData,
          test: (res) => {
            if (res.body.COURSE_ID !== postData.COURSE_ID) {
              throw new Error('New model did not have the expected COURSE_ID');
            }
          }
        },
        {
          data: patchData,
          test: (res) => {
            if (res.body.MODE !== patchData.MODE) {
              throw new Error('Patched model did not have the expected MODE');
            }
          }
        }
      )
    );
  });

  describe('Test Course Instance API', () => {
    const endpoint = `${RESTIFY_ROOT}/courseInstance`;
    beforeEach('Setup Course Instance', (beforeDone) => {
      db.prepCourseInstance(beforeDone);
    });
    afterEach('Remove Course Instance', (afterDone) => {
      db.cleanCourseInstance(afterDone);
    });

    const postData = db.getCourseInstanceData();
    postData.COURSE_INSTANCE_ID = 'courseInstance002';
    const patchData = {
      ACADEMIC_YEAR: postData.ACADEMIC_YEAR + 1
    };

    describe(
      'REST tests',
      testREST.bind(
        null,
        'course instance',
        endpoint,
        db,
        {
          data: postData,
          test: (res) => {
            if (res.body.COURSE_INSTANCE_ID !== postData.COURSE_INSTANCE_ID) {
              throw new Error(
                'New model did not have the expected COURSE_INSTANCE_ID'
              );
            }
          }
        },
        {
          data: patchData,
          test: (res) => {
            if (res.body.ACADEMIC_YEAR !== patchData.ACADEMIC_YEAR) {
              throw new Error(
                'Patched model did not have the expected ACADEMIC_YEAR'
              );
            }
          }
        }
      )
    );
  });

  describe('Test Module API', () => {
    const endpoint = `${RESTIFY_ROOT}/module`;
    beforeEach('Setup Module', (beforeDone) => {
      db.prepModule(beforeDone);
    });
    afterEach('Remove Module', (afterDone) => {
      db.cleanModule(afterDone);
    });

    const postData = db.getModuleData('module002');
    const patchData = {
      MOD_NAME: 'Updated module'
    };

    describe(
      'REST tests',
      testREST.bind(
        null,
        'module',
        endpoint,
        db,
        {
          data: postData,
          test: (res) => {
            if (res.body.MOD_ID !== postData.MOD_ID) {
              throw new Error('New model did not have the expected MOD_ID');
            }
          }
        },
        {
          data: patchData,
          test: (res) => {
            if (res.body.MOD_NAME !== patchData.MOD_NAME) {
              throw new Error(
                'Patched model did not have the expected MOD_NAME'
              );
            }
          }
        }
      )
    );
  });

  describe('Test Module Instance API', () => {
    const endpoint = `${RESTIFY_ROOT}/moduleInstance`;
    beforeEach('Setup Module Instance', (beforeDone) => {
      db.prepModuleInstance(beforeDone);
    });
    afterEach('Remove Module Instance', (afterDone) => {
      db.cleanModuleInstance(afterDone);
    });

    const postData = db.getModuleInstanceData(db.moduleId, 'modInstance002');
    const patchData = {
      MOD_LOCATION: 'updated location'
    };

    describe(
      'REST tests',
      testREST.bind(
        null,
        'module instance',
        endpoint,
        db,
        {
          data: postData,
          test: (res) => {
            if (res.body.MOD_INSTANCE_ID !== postData.MOD_INSTANCE_ID) {
              throw new Error(
                'New model did not have the expected MOD_INSTANCE_ID'
              );
            }
          }
        },
        {
          data: patchData,
          test: (res) => {
            if (res.body.MOD_LOCATION !== patchData.MOD_LOCATION) {
              throw new Error(
                'Patched model did not have the expected MOD_LOCATION'
              );
            }
          }
        }
      )
    );
  });

  describe('Test Module VLE Map API', () => {
    const endpoint = `${RESTIFY_ROOT}/moduleVleMap`;
    beforeEach('Setup Module VLE Map', (beforeDone) => {
      db.prepModuleVleMap(beforeDone);
    });
    afterEach('Remove Module VLE Map', (afterDone) => {
      db.cleanModuleVleMap(afterDone);
    });

    const postData = db.getModuleVleMapData();
    postData.VLE_MOD_ID = db.secondaryId;
    const patchData = {
      MOD_INSTANCE_ID: 'updated MOD_INSTANCE_ID'
    };

    describe(
      'REST tests',
      testREST.bind(
        null,
        'module vle map',
        endpoint,
        db,
        {
          data: postData,
          test: (res) => {
            if (res.body.VLE_MOD_ID !== postData.VLE_MOD_ID) {
              throw new Error('New model did not have the expected VLE_MOD_ID');
            }
          }
        },
        {
          data: patchData,
          test: (res) => {
            if (res.body.MOD_INSTANCE_ID !== patchData.MOD_INSTANCE_ID) {
              throw new Error(
                'Patched model did not have the expected MOD_INSTANCE_ID'
              );
            }
          }
        }
      )
    );
  });

  describe('Test Institution API', () => {
    const endpoint = `${RESTIFY_ROOT}/institution`;
    beforeEach('Setup institution', (beforeDone) => {
      db.prepInstitution(beforeDone);
    });
    afterEach('Remove institution', (afterDone) => {
      db.cleanInstitution(afterDone);
    });

    const postData = db.getInstitutionData('tenant002');
    const patchData = {
      TENANT_NAME: 'Updated institution'
    };

    describe(
      'REST tests',
      testREST.bind(
        null,
        'institution',
        endpoint,
        db,
        {
          data: postData,
          test: (res) => {
            if (res.body.TENANT_ID !== postData.TENANT_ID) {
              throw new Error('New model did not have the expected TENANT_ID');
            }
          }
        },
        {
          data: patchData,
          test: (res) => {
            if (res.body.TENANT_NAME !== patchData.TENANT_NAME) {
              throw new Error(
                'Patched model did not have the expected TENANT_NAME'
              );
            }
          }
        }
      )
    );
  });

  describe('Test Assessment Instance API', () => {
    const endpoint = `${RESTIFY_ROOT}/assessmentInstance`;
    beforeEach('Setup assessmentInstance', (beforeDone) => {
      db.prepAssessmentInstance(beforeDone);
    });
    afterEach('Remove assessmentInstance', (afterDone) => {
      db.cleanAssessmentInstance(afterDone);
    });

    const postData = db.getAssessmentInstanceData();
    postData.ASSESS_INSTANCE_ID = db.secondaryId;
    const patchData = {
      ASSESS_WEIGHT: postData.ASSESS_WEIGHT + 1
    };

    describe(
      'REST tests',
      testREST.bind(
        null,
        'assessment instance',
        endpoint,
        db,
        {
          data: postData,
          test: (res) => {
            if (res.body.ASSESS_INSTANCE_ID !== postData.ASSESS_INSTANCE_ID) {
              throw new Error(
                'New model did not have the expected ASSESS_INSTANCE_ID'
              );
            }
          }
        },
        {
          data: patchData,
          test: (res) => {
            if (res.body.ASSESS_WEIGHT !== patchData.ASSESS_WEIGHT) {
              throw new Error(
                'Patched model did not have the expected ASSESS_WEIGHT'
              );
            }
          }
        }
      )
    );
  });

  describe('Test Staff API', () => {
    const endpoint = `${RESTIFY_ROOT}/staff`;
    beforeEach('Setup staff', (beforeDone) => {
      db.prepStaff(beforeDone);
    });
    afterEach('Remove staff', (afterDone) => {
      db.cleanStaff(afterDone);
    });

    const postData = db.getStaffData('staff002');
    const patchData = {
      FIRST_NAME: 'UpdatedFirstName'
    };

    describe(
      'REST tests',
      testREST.bind(
        null,
        'staff',
        endpoint,
        db,
        {
          data: postData,
          test: (res) => {
            if (res.body.STAFF_ID !== postData.STAFF_ID) {
              throw new Error(
                `New model did not have the expected STAFF_ID, got ${res.body.STAFF_ID} expected ${postData.STAFF_ID}`
              );
            }
          }
        },
        {
          data: patchData,
          test: (res) => {
            if (res.body.FIRST_NAME !== patchData.FIRST_NAME) {
              throw new Error(
                'Patched model did not have the expected FIRST_NAME'
              );
            }
          }
        }
      )
    );
  });

  describe('Test Staff Course Instance API', () => {
    const endpoint = `${RESTIFY_ROOT}/staffCourseInstance`;
    const initData = db.getStaffCourseInstanceData();
    beforeEach('Setup staff course instance', (beforeDone) => {
      db.prepStaffCourseInstance(beforeDone, initData);
    });
    afterEach('Remove staff course instance', (afterDone) => {
      db.cleanStaffCourseInstance(afterDone);
    });

    const newStaffID = 'STAFF_1234567890';
    const postData = db.getStaffCourseInstanceData(newStaffID);
    const patchData = {
      COURSE_INSTANCE_ID: db.secondaryId
    };

    describe(
      'REST tests',
      testREST.bind(
        null,
        'staff course instance',
        endpoint,
        db,
        {
          data: postData,
          test: (res) => {
            if (res.body.STAFF_ID.toString() !== postData.STAFF_ID.toString()) {
              throw new Error('New model did not have the expected STAFF_ID');
            }
          }
        },
        {
          data: patchData,
          test: (res) => {
            if (res.body.COURSE_INSTANCE_ID !== patchData.COURSE_INSTANCE_ID) {
              throw new Error(
                'Patched model did not have the expected COURSE_INSTANCE_ID'
              );
            }
          }
        }
      )
    );
  });

  describe('Test Staff Module Instance API', () => {
    const endpoint = `${RESTIFY_ROOT}/staffModuleInstance`;
    beforeEach('Setup staff module instance', (beforeDone) => {
      db.prepStaffModuleInstance(beforeDone);
    });
    afterEach('Remove staff module instance', (afterDone) => {
      db.cleanStaffModuleInstance(afterDone);
    });

    const newStaffID = 'STAFF_1234567890';
    const postData = db.getStaffModuleInstanceData(newStaffID);
    const patchData = {
      MOD_INSTANCE_ID: db.secondaryId
    };

    describe(
      'REST tests',
      testREST.bind(
        null,
        'staff module instance',
        endpoint,
        db,
        {
          data: postData,
          test: (res) => {
            if (res.body.STAFF_ID !== postData.STAFF_ID) {
              throw new Error('New model did not have the expected STAFF_ID');
            }
          }
        },
        {
          data: patchData,
          test: (res) => {
            if (res.body.MOD_INSTANCE_ID !== patchData.MOD_INSTANCE_ID) {
              throw new Error(
                'Patched model did not have the expected MOD_INSTANCE_ID'
              );
            }
          }
        }
      )
    );
  });

  describe('Test Student Assessment Instance API', () => {
    const endpoint = `${RESTIFY_ROOT}/studentAssessmentInstance`;
    beforeEach('Setup student assessment instance', (beforeDone) => {
      db.prepStudentAssessmentInstance(beforeDone);
    });
    afterEach('Remove student assessment instance', (afterDone) => {
      db.cleanStudentAssessmentInstance(afterDone);
    });

    const postData = db.getStudentAssessmentInstanceData();
    const patchData = {
      ASSESS_INSTANCE_ID: db.secondaryId
    };

    describe(
      'REST tests',
      testREST.bind(
        null,
        'student assessment instance',
        endpoint,
        db,
        {
          data: postData,
          test: (res) => {
            if (res.body.STAFF_ID !== postData.STAFF_ID) {
              throw new Error('New model did not have the expected STAFF_ID');
            }
          }
        },
        {
          data: patchData,
          test: (res) => {
            if (res.body.ASSESS_INSTANCE_ID !== patchData.ASSESS_INSTANCE_ID) {
              throw new Error(
                'Patched model did not have the expected ASSESS_INSTANCE_ID'
              );
            }
          }
        }
      )
    );
  });

  describe('Test Student Course Membership API', () => {
    const endpoint = `${RESTIFY_ROOT}/studentCourseMembership`;
    beforeEach('Setup student course membership', (beforeDone) => {
      db.prepStudentCourseMembership(beforeDone);
    });
    afterEach('Remove student course membership', (afterDone) => {
      db.cleanStudentCourseMembership(afterDone);
    });

    const postData = db.getStudentCourseMembershipData();
    postData.STUDENT_COURSE_MEMBERSHIP_ID = db.secondaryId;
    const patchData = {
      WITHDRAWAL_REASON: 2
    };

    describe(
      'REST tests',
      testREST.bind(
        null,
        'student course membership',
        endpoint,
        db,
        {
          data: postData,
          test: (res) => {
            if (
              res.body.STUDENT_COURSE_MEMBERSHIP_ID !==
              postData.STUDENT_COURSE_MEMBERSHIP_ID
            ) {
              throw new Error(
                'New model did not have the expected STUDENT_COURSE_MEMBERSHIP_ID'
              );
            }
          }
        },
        {
          data: patchData,
          test: (res) => {
            if (res.body.WITHDRAWAL_REASON !== patchData.WITHDRAWAL_REASON) {
              throw new Error(
                'Patched model did not have the expected WITHDRAWAL_REASON'
              );
            }
          }
        }
      )
    );
  });
});
