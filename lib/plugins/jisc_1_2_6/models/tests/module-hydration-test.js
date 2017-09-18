import { getConnection } from 'lib/connections/mongoose';
import { expect } from 'chai';
import _ from 'lodash';
import async from 'async';

import Module from 'lib/plugins/jisc_1_2_6/models/module';
import ModuleInstance from 'lib/plugins/jisc_1_2_6/models/moduleInstance';
import ModuleVleMap from 'lib/plugins/jisc_1_2_6/models/moduleVleMap';
import StaffModuleInstance from 'lib/plugins/jisc_1_2_6/models/staffModuleInstance';
import StudentModuleInstance from 'lib/plugins/jisc_1_2_6/models/studentModuleInstance';
import AssessmentInstance from 'lib/plugins/jisc_1_2_6/models/assessmentInstance';
import StudentAssessmentInstance from 'lib/plugins/jisc_1_2_6/models/studentAssessmentInstance';
import DBHelper from 'lib/plugins/jisc_1_2_6/utils/TestDBHelper';

const db = new DBHelper();

describe('Test the relation hydration on JISC modules', () => {
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


  describe('add module related models and test for relations', () => {
    let savedModels;
    const moduleData = db.getModuleData();
    const miData = db.getModuleInstanceData(moduleData.MOD_ID);
    const mvleData = db.getModuleVleMapData(miData.MOD_INSTANCE_ID);
    const staffmiData = db.getStaffModuleInstanceData(db.staffId, miData.MOD_INSTANCE_ID);
    const studentmiData = db.getStudentModuleInstanceData(db.studentId, miData.MOD_INSTANCE_ID);
    const aiData = db.getAssessmentInstanceData(miData.MOD_INSTANCE_ID);
    const saiData = db.getStudentAssessmentInstanceData(db.studentId, miData.MOD_INSTANCE_ID);

    beforeEach('Insert module and related models', (done) => {
      async.series({
        mi: insertDone => db.prepModuleInstance(insertDone, miData),
        mvle: insertDone => db.prepModuleVleMap(insertDone, mvleData),
        staffmi: insertDone => db.prepStaffModuleInstance(insertDone, staffmiData),
        module: insertDone => db.prepModule(insertDone, moduleData),
        studentmi: insertDone => db.prepStudentModuleInstance(insertDone, studentmiData),
        ai: insertDone => db.prepAssessmentInstance(insertDone, aiData),
        sai: insertDone => db.prepStudentAssessmentInstance(insertDone, saiData),
      }, (err, results) => {
        savedModels = results;
        done(err);
      });
    });

    afterEach('Clean up related models', (done) => {
      async.parallel({
        module: cleanDone => db.cleanModule(cleanDone),
        mi: cleanDone => db.cleanModuleInstance(cleanDone),
        mvle: cleanDone => db.cleanModuleVleMap(cleanDone),
        staffmi: cleanDone => db.cleanStaffModuleInstance(cleanDone),
        studentmi: cleanDone => db.cleanStudentModuleInstance(cleanDone),
        ai: cleanDone => db.cleanAssessmentInstance(cleanDone),
        sai: cleanDone => db.cleanStudentAssessmentInstance(cleanDone),
      }, (err) => {
        done(err);
      });
    });

    it('should find hydrated moduleInstances relation on the module', (done) => {
      Module.findOne({ MOD_ID: moduleData.MOD_ID }, (err, model) => {
        expect(model).to.not.be.null; //eslint-disable-line
        const modelData = model.toObject();
        expect(modelData.moduleInstances).to.be.an('Array').and.have.lengthOf(1);
        expect(_.toString(modelData.moduleInstances[0])).to.equal(_.toString(savedModels.mi._id));
        done(err);
      });
    });

    it('should find multiple hydrated relations on the module instance', (done) => {
      ModuleInstance.findOne({ MOD_INSTANCE_ID: miData.MOD_INSTANCE_ID }, (err, model) => {
        expect(model).to.not.be.null; //eslint-disable-line
        const modelData = model.toObject();
        expect(modelData.moduleVleMaps).to.be.an('Array').and.have.lengthOf(1, 'moduleVleMaps is missing');
        expect(modelData.staffModuleInstances).to.be.an('Array').and.have.lengthOf(1, 'staffModuleInstances is missing');
        expect(modelData.studentModuleInstances).to.be.an('Array').and.have.lengthOf(1, 'studentModuleInstances is missing');
        expect(modelData.assessmentInstances).to.be.an('Array').and.have.lengthOf(1, 'assessmentInstances is missing');
        expect(modelData.studentAssessmentInstances).to.be.an('Array').and.have.lengthOf(1, 'studentAssessmentInstances is missing');

        expect(_.toString(modelData.moduleVleMaps[0])).to.equal(_.toString(savedModels.mvle._id), 'moduleVleMaps ID is wrong');
        expect(_.toString(modelData.staffModuleInstances[0])).to.equal(_.toString(savedModels.staffmi._id), 'staff staffModuleInstances ID is wrong');
        expect(_.toString(modelData.studentModuleInstances[0])).to.equal(_.toString(savedModels.studentmi._id), 'student studentModuleInstances ID is wrong');
        expect(_.toString(modelData.assessmentInstances[0])).to.equal(_.toString(savedModels.ai._id), 'assessmentInstances ID is wrong');
        expect(_.toString(modelData.studentAssessmentInstances[0])).to.equal(_.toString(savedModels.sai._id), 'studentAssessmentInstances ID is wrong');
        done(err);
      });
    });

    it('should find hydrated moduleInstance relation on the module vle map', (done) => {
      ModuleVleMap.findById(savedModels.mvle._id, (err, model) => {
        expect(model).to.not.be.null; //eslint-disable-line
        const modelData = model.toObject();
        expect(_.toString(modelData.moduleInstance)).to.equal(_.toString(savedModels.mi._id));
        done(err);
      });
    });

    it('should find hydrated moduleInstance relation on the staff module instance', (done) => {
      StaffModuleInstance.findById(savedModels.staffmi._id, (err, model) => {
        expect(model).to.not.be.null; //eslint-disable-line
        const modelData = model.toObject();
        expect(_.toString(modelData.moduleInstance)).to.equal(_.toString(savedModels.mi._id));
        done(err);
      });
    });

    it('should find hydrated moduleInstance relation on the student module instance', (done) => {
      StudentModuleInstance.findById(savedModels.studentmi._id, (err, model) => {
        expect(model).to.not.be.null; //eslint-disable-line
        const modelData = model.toObject();
        expect(_.toString(modelData.moduleInstance)).to.equal(_.toString(savedModels.mi._id));
        done(err);
      });
    });

    it('should find hydrated moduleInstance relation on the assessment instance', (done) => {
      AssessmentInstance.findById(savedModels.ai._id, (err, model) => {
        expect(model).to.not.be.null; //eslint-disable-line
        const modelData = model.toObject();
        expect(_.toString(modelData.moduleInstance)).to.equal(_.toString(savedModels.mi._id));
        done(err);
      });
    });

    it('should find hydrated moduleInstance relation on the student assessment instance', (done) => {
      StudentAssessmentInstance.findById(savedModels.sai._id, (err, model) => {
        expect(model).to.not.be.null; //eslint-disable-line
        const modelData = model.toObject();
        expect(_.toString(modelData.moduleInstance)).to.equal(_.toString(savedModels.mi._id));
        done(err);
      });
    });

    it('should delete the Module and remove the related models from ModuleInstances', (done) => {
      savedModels.module.remove().then(() => {
        ModuleInstance.findById(savedModels.mi._id, (err, mi) => {
          if (err) return done(err);
          expect(mi).to.not.equal(null);
          expect(mi.module).to.equal(null);
          done();
        });
      });
    });

    it('should delete the ModuleInstance and remove the related models from Module, ModuleVleMaps, StaffModuleInstances, StudentModuleInstances', (done) => {
      savedModels.mi.remove().then(() => {
        Module.findById(savedModels.module._id, (err, mod) => {
          if (err) return done(err);
          expect(mod).to.not.equal(null);
          expect(mod.moduleInstances).to.be.an('Array').and.have.lengthOf(0);

          ModuleVleMap.findById(savedModels.mvle._id, (err, mvm) => {
            if (err) return done(err);
            expect(mvm).to.not.equal(null);
            expect(mvm.moduleInstance).to.equal(null);

            StudentModuleInstance.findById(savedModels.studentmi._id, (err, smi) => {
              if (err) return done(err);
              expect(smi).to.not.equal(null);
              expect(smi.moduleInstance).to.equal(null);

              StaffModuleInstance.findById(savedModels.staffmi._id, (err, stmi) => {
                if (err) return done(err);
                expect(stmi).to.not.equal(null);
                expect(stmi.moduleInstance).to.equal(null);

                AssessmentInstance.findById(savedModels.ai._id, (err, ai) => {
                  if (err) return done(err);
                  expect(ai).to.not.equal(null);
                  expect(ai.moduleInstance).to.equal(null);
                  done();
                });
              });
            });
          });
        });
      }).catch(done);
    });

    it('should delete the ModuleVleMaps and remove the related models from ModuleInstances', (done) => {
      savedModels.mvle.remove().then(() => {
        ModuleInstance.findById(savedModels.mi._id, (err, mi) => {
          if (err) return done(err);
          expect(mi).to.not.equal(null);
          expect(mi.moduleVleMaps).to.be.an('Array').and.have.lengthOf(0);
          done();
        });
      });
    });

    it('should delete the StaffModuleInstances and remove the related models from ModuleInstances', (done) => {
      savedModels.staffmi.remove().then(() => {
        ModuleInstance.findById(savedModels.mi._id, (err, mi) => {
          if (err) return done(err);
          expect(mi).to.not.equal(null);
          expect(mi.staffModuleInstances).to.be.an('Array').and.have.lengthOf(0);
          done();
        });
      });
    });

    it('should delete the StudentModuleInstances and remove the related models from ModuleInstances', (done) => {
      savedModels.studentmi.remove().then(() => {
        ModuleInstance.findById(savedModels.mi._id, (err, mi) => {
          if (err) return done(err);
          expect(mi).to.not.equal(null);
          expect(mi.studentModuleInstances).to.be.an('Array').and.have.lengthOf(0);
          done();
        });
      });
    });

    it('should delete the AssessmentInstance and remove the related models from StudentAssessmentInstance and ModuleInstance', (done) => {
      savedModels.ai.remove().then(() => {
        StudentAssessmentInstance.findById(savedModels.sai._id, (err, sai) => {
          if (err) return done(err);
          expect(sai).to.not.equal(null);
          expect(sai.assessmentInstance).to.equal(null);
          ModuleInstance.findById(savedModels.mi._id, (err, mi) => {
            if (err) return done(err);
            expect(mi).to.not.equal(null);
            expect(mi.assessmentInstances).to.be.an('Array').and.have.lengthOf(0);
            done();
          });
        });
      });
    });

    it('should delete the StudentAssessmentInstance and remove the related models from AssessmentInstance and ModuleInstance', (done) => {
      savedModels.sai.remove().then(() => {
        AssessmentInstance.findById(savedModels.ai._id, (err, ai) => {
          if (err) return done(err);
          expect(ai).to.not.equal(null);
          expect(ai.studentAssessmentInstances).to.be.an('Array').and.have.lengthOf(0);
          ModuleInstance.findById(savedModels.mi._id, (err, mi) => {
            if (err) return done(err);
            expect(mi).to.not.equal(null);
            expect(mi.studentAssessmentInstances).to.be.an('Array').and.have.lengthOf(0);
            done();
          });
        });
      });
    });
  });
});
