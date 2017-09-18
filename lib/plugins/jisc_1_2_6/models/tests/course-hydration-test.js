import { getConnection } from 'lib/connections/mongoose';
import { expect } from 'chai';
import _ from 'lodash';
import async from 'async';
import Course from 'lib/plugins/jisc_1_2_6/models/course';
import StudentCourseMembership from 'lib/plugins/jisc_1_2_6/models/studentCourseMembership';
import CourseInstance from 'lib/plugins/jisc_1_2_6/models/courseInstance';
import DBHelper from 'lib/plugins/jisc_1_2_6/utils/TestDBHelper';

const db = new DBHelper();

describe('Test the relation hydration on JISC courses', () => {
  before((done) => {
    const connection = getConnection('JISC_1_2_6');
    if (connection.readyState !== 1) {
      connection.on('connected', done);
    } else {
      done();
    }
  });

  before('Set up client with "all" scopes', (done) => {
    db.prepareClient(done);
  });

  after('Clear client with "all" scopes', (done) => {
    db.cleanUpClient(done);
  });


  describe('add course related models and test for relations', () => {
    let savedModels;
    const courseData = db.getCourseData();
    const ciData = db.getCourseInstanceData(courseData.COURSE_ID);
    const scmData = db.getStudentCourseMembershipData(db.studentId, courseData.COURSE_ID);

    beforeEach('Insert course and related models', (done) => {
      async.series({
        scm: insertDone => db.prepStudentCourseMembership(insertDone, scmData),
        course: insertDone => db.prepCourse(insertDone, courseData),
        ci: insertDone => db.prepCourseInstance(insertDone, ciData),
      }, (err, results) => {
        savedModels = results;
        done(err);
      });
    });

    afterEach('Clean up related models', (done) => {
      async.parallel({
        course: cleanDone => db.cleanCourse(cleanDone),
        scm: cleanDone => db.cleanStudentCourseMembership(cleanDone),
        ci: cleanDone => db.cleanCourseInstance(cleanDone),
      }, (err) => {
        done(err);
      });
    });

    it('should find multiple hydrated relations on the course', (done) => {
      Course.findOne({ COURSE_ID: courseData.COURSE_ID }, (err, model) => {
        expect(model).to.not.be.null; //eslint-disable-line
        const modelData = model.toObject();
        expect(modelData.studentCourseMemberships).to.be.an('Array').and.have.lengthOf(1);
        expect(modelData.courseInstances).to.be.an('Array').and.have.lengthOf(1);
        expect(_.toString(modelData.studentCourseMemberships[0])).to.equal(_.toString(savedModels.scm._id));
        expect(_.toString(modelData.courseInstances[0])).to.equal(_.toString(savedModels.ci._id));
        done(err);
      });
    });

    it('should find hydrated course relation on the student course membership', (done) => {
      StudentCourseMembership.findById(savedModels.scm._id, (err, model) => {
        expect(model).to.not.be.null; //eslint-disable-line
        const modelData = model.toObject();
        expect(_.toString(modelData.course)).to.equal(_.toString(savedModels.course._id));
        done(err);
      });
    });

    it('should find hydrated course relation on the course instance', (done) => {
      CourseInstance.findById(savedModels.ci._id, (err, model) => {
        expect(model).to.not.be.null; //eslint-disable-line
        const modelData = model.toObject();
        expect(_.toString(modelData.course)).to.equal(_.toString(savedModels.course._id));
        done(err);
      });
    });

    it('should delete the Course and remove the related models from StudentCourseMembership and CourseInstance', (done) => {
      savedModels.course.remove().then(() => {
        CourseInstance.findById(savedModels.ci._id, (err, ci) => {
          expect(ci).to.not.be.null; //eslint-disable-line
          const ciModelData = ci.toObject();
          expect(ciModelData.course).to.equal(null);

          StudentCourseMembership.findById(savedModels.scm._id, (err, scm) => {
            expect(scm).to.not.be.null; //eslint-disable-line
            const scmModelData = scm.toObject();
            expect(scmModelData.course).to.equal(null);
            done(err);
          });
        });
      }).catch(done);
    });

    it('should delete the StudentCourseMembership and remove the related models from Course', (done) => {
      savedModels.scm.remove().then(() => {
        Course.findById(savedModels.course._id, (err, course) => {
          if (err) return done(err);
          expect(course).to.not.be.null; //eslint-disable-line
          const courseModelData = course.toObject();
          expect(courseModelData.studentCourseMemberships).to.be.an('Array').and.have.lengthOf(0);
          done();
        });
      }).catch(done);
    });

    it('should delete the CourseInstance and remove the related models from Course', (done) => {
      savedModels.ci.remove().then(() => {
        Course.findById(savedModels.course._id, (err, course) => {
          if (err) return done(err);
          expect(course).to.not.be.null; //eslint-disable-line
          const courseModelData = course.toObject();
          expect(courseModelData.courseInstances).to.be.an('Array').and.have.lengthOf(0);
          done();
        });
      }).catch(done);
    });
  });
});
