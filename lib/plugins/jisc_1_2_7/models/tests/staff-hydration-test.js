import { getConnection } from 'lib/connections/mongoose';
import { expect } from 'chai';
import _ from 'lodash';
import async from 'async';
import Staff from 'lib/plugins/jisc_1_2_7/models/staff';
import StaffCourseInstance from 'lib/plugins/jisc_1_2_7/models/staffCourseInstance';
import StaffModuleInstance from 'lib/plugins/jisc_1_2_7/models/staffModuleInstance';
import Student from 'lib/plugins/jisc_1_2_7/models/student';

import DBHelper from 'lib/plugins/jisc_1_2_7/utils/TestDBHelper';

const db = new DBHelper();

describe('Test the relation hydration on JISC staff', () => {
  before((done) => {
    const connection = getConnection('JISC_1_2_7');
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
    const staffData = db.getStaffData();
    const student1Data = db.getStudentData('student01', db.staffId);
    const student2Data = db.getStudentData('student02', db.staffId);
    const sciData = db.getStaffCourseInstanceData(staffData.STAFF_ID);
    const smiData = db.getStaffModuleInstanceData(staffData.STAFF_ID);

    beforeEach('Insert course and related models', (done) => {
      async.series({
        sci: insertDone => db.prepStaffCourseInstance(insertDone, sciData),
        staff: insertDone => db.prepStaff(insertDone, staffData),
        smi: insertDone => db.prepStaffModuleInstance(insertDone, smiData),
        student1: insertDone => db.prepStudent(insertDone, student1Data, db.defaultId),
        student2: insertDone => db.prepStudent(insertDone, student2Data, db.secondaryId),
      }, (err, results) => {
        savedModels = results;
        done(err);
      });
    });

    afterEach('Clean up related models', (done) => {
      async.parallel({
        staff: cleanDone => db.cleanStaff(cleanDone),
        smi: cleanDone => db.cleanStaffModuleInstance(cleanDone),
        sci: cleanDone => db.cleanStaffCourseInstance(cleanDone),
        students: cleanDone => db.cleanStudent(cleanDone),
      }, (err) => {
        done(err);
      });
    });

    it('should find multiple hydrated relations on the staff', (done) => {
      Staff.findOne({ STAFF_ID: staffData.STAFF_ID }, (err, model) => {
        expect(model).to.not.be.null; //eslint-disable-line
        const modelData = model.toObject();
        expect(modelData.staffCourseInstances).to.be.an('Array').and.have.lengthOf(1);
        expect(modelData.staffModuleInstances).to.be.an('Array').and.have.lengthOf(1);
        expect(modelData.mentees).to.be.an('Array').and.have.lengthOf(2);
        expect(_.toString(modelData.staffCourseInstances[0])).to.equal(_.toString(savedModels.sci._id));
        expect(_.toString(modelData.staffModuleInstances[0])).to.equal(_.toString(savedModels.smi._id));
        done(err);
      });
    });

    it('should find hydrated staff relation on the staff course instance', (done) => {
      StaffCourseInstance.findById(savedModels.sci._id, (err, model) => {
        expect(model).to.not.be.null; //eslint-disable-line
        const modelData = model.toObject();
        expect(_.toString(modelData.staff)).to.equal(_.toString(savedModels.staff._id));
        done(err);
      });
    });

    it('should find hydrated staff relation on the staff module instance', (done) => {
      StaffModuleInstance.findById(savedModels.smi._id, (err, model) => {
        expect(model).to.not.be.null; //eslint-disable-line
        const modelData = model.toObject();
        expect(_.toString(modelData.staff)).to.equal(_.toString(savedModels.staff._id));
        done(err);
      });
    });

    it('should find hydrated staff (tutor) relation on student1', (done) => {
      Student.findById(savedModels.student1._id, (err, model) => {
        expect(model).to.not.be.null; //eslint-disable-line
        const modelData = model.toObject();
        expect(_.toString(modelData.tutor)).to.equal(_.toString(savedModels.staff._id));
        done(err);
      });
    });

    it('should find hydrated staff (tutor) relation on student2', (done) => {
      Student.findById(savedModels.student2._id, (err, model) => {
        expect(model).to.not.be.null; //eslint-disable-line
        const modelData = model.toObject();
        expect(_.toString(modelData.tutor)).to.equal(_.toString(savedModels.staff._id));
        done(err);
      });
    });

    it('should delete Staff and remove related models from StaffCourseInstance and StaffModuleInstance', (done) => {
      savedModels.staff.remove().then(() => {
        StaffCourseInstance.findById(savedModels.sci._id, (err, sci) => {
          if (err) return done(err);
          expect(sci).to.not.equal(null);
          expect(sci.staff).to.equal(null);
          StaffModuleInstance.findById(savedModels.smi._id, (err, smi) => {
            if (err) return done(err);
            expect(smi).to.not.equal(null);
            expect(smi.staff).to.equal(null);
            Student.findById(savedModels.student1._id, (err, student1) => {
              if (err) return done(err);
              expect(student1).to.not.equal(null);
              expect(student1.tutor).to.equal(null);
              Student.findById(savedModels.student2._id, (err, student2) => {
                if (err) return done(err);
                expect(student2).to.not.equal(null);
                expect(student2.tutor).to.equal(null);
                done();
              });
            });
          });
        });
      }).catch(done);
    });

    it('should delete StaffCourseInstance and remove related models from Staff', (done) => {
      savedModels.sci.remove().then(() => {
        Staff.findById(savedModels.staff._id, (err, staff) => {
          if (err) return done(err);
          expect(staff).to.not.equal(null);
          expect(staff.staffCourseInstances).to.be.an('Array').and.have.lengthOf(0);
          done();
        });
      }).catch(done);
    });

    it('should delete StaffModuleInstance and remove related models from Staff', (done) => {
      savedModels.smi.remove().then(() => {
        Staff.findById(savedModels.staff._id, (err, staff) => {
          if (err) return done(err);
          expect(staff).to.not.equal(null);
          expect(staff.staffModuleInstances).to.be.an('Array').and.have.lengthOf(0);
          done();
        });
      }).catch(done);
    });

    it('should delete student1, then student2 and remove related models from Staff each time', (done) => {
      savedModels.student1.remove().then(() => {
        Staff.findById(savedModels.staff._id, (err, staff) => {
          if (err) return done(err);
          expect(staff).to.not.equal(null);
          expect(staff.mentees).to.be.an('Array').and.have.lengthOf(1);
          savedModels.student2.remove().then(() => {
            Staff.findById(savedModels.staff._id, (err, updatedStaff) => {
              if (err) return done(err);
              expect(updatedStaff).to.not.equal(null);
              expect(updatedStaff.mentees).to.be.an('Array').and.have.lengthOf(0);
              done();
            });
          });
        });
      }).catch(done);
    });
  });
});
