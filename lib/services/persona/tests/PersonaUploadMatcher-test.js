/* eslint-disable no-unused-expressions */
import chai, { expect } from 'chai';
import { getConnection } from 'lib/connections/mongoose';
import {
  STATEMENT_ACTOR_MBOX,
  STATEMENT_ACTOR_NAME,
  STATEMENT_ACTOR_ACCOUNT_NAME
} from 'lib/constants/statements';

import { getUniqueIdentifiersFromDoc,
        getScorableIdentifiers,
        getPersonaIdentifierFromDoc,
} from 'lib/services/persona';

import { setUploadCounts } from 'lib/services/persona/addPersonasToQueue';
// import personaUploadHandler from 'worker/handlers/upload/personaUploadHandler';
import PersonaUploadMatcherHelper from './PersonaUploadMatcherHelper';

chai.should();
chai.use(require('chai-things'));

const db = new PersonaUploadMatcherHelper();
const modelId = '57b2d8479bebf26c6fe4eabb';
// const dataIds = [
//   '57b3216f6d253f2032698867',
//   '57b3216f6d253f2032698868',
//   '57b3216f6d253f2032698869',
//   '57b3216f6d253f203269886a'
// ];
const singleMatchedIndexes = {
  _id: '57b1b64261607cca66bbbc7b',
  homePageIndex: -1,
  nameIndex: -1,
  openIdIndex: -1,
  lastnameIndex: 3,
  firstnameIndex: 2,
  emailIndex: 4,
  usernameIndex: 0
};
const multiMatchedIndexes = {
  _id: '57b1b64261607cca66bbbc7b',
  homePageIndex: 10,
  nameIndex: -1,
  openIdIndex: 11,
  lastnameIndex: 3,
  firstnameIndex: 2,
  emailIndex: 4,
  usernameIndex: 0
};
describe('Upload persona identifiers from CSV', () => {
  before((done) => {
    const connection = getConnection();
    if (connection.readyState !== 1) {
      connection.on('connected', done);
    } else {
      done();
    }
  });

  beforeEach('Set up people and statements for testing', (done) => {
    db.prepare(done);
  });

  afterEach('Clear db collections', (done) => {
    db.cleanUp(done);
  });

  // TODO - flaky, needs further investigation
  // describe('personaUploadHandler', () => {
  //   it('should take the documents from DB and importId and create personas', (done) => {
  //     personaUploadHandler({ dataIds, importId: modelId }, (err) => {
  //       if (err) return done(err);
  //       expect(err).to.equal(null);
  //       done();
  //     });
  //   });
  // });

  describe('getPersonaIdentifierFromDoc', () => {
    const doc = db.getUploadSingleMultiIdents();
    const org = '56fbb868f1ec870140f0f9f8';
    it('should take an uploaded data row and return a persona and a personaIdentifier', (done) => {
      getPersonaIdentifierFromDoc({ data: doc }, { organisation: org, matchedIndexes: multiMatchedIndexes }, (err, results) => {
        if (err) return done(err);
        expect(results.personaIdentifiers).to.exist;
        expect(results.persona).to.exist;
        expect(err).to.equal(null);
        done();
      });
    });
  });

  describe('getUniqueIdentifiersFromDoc', () => {
    const doc = db.getUploadSingleMultiIdents();
    it('should return a unique identifier', (done) => {
      getUniqueIdentifiersFromDoc(doc, singleMatchedIndexes, (err, results) => {
        if (err) return done(err);
        expect(results).to.have.lengthOf(1);
        expect(err).to.equal(null);
        done();
      });
    });
    it('should return an array unique identifiers', (done) => {
      getUniqueIdentifiersFromDoc(doc, multiMatchedIndexes, (err, results) => {
        if (err) return done(err);
        expect(results).to.have.lengthOf(3);
        expect(err).to.equal(null);
        done();
      });
    });
  });

  describe('getScorableIdentifiers', () => {
    const doc = db.getUploadSingleMultiIdents();
    const org = '56fbb868f1ec870140f0f9f8';
    it('should return array of other identifiers to match', (done) => {
      const email = 'Sofia.Abrahams@email.com';
      const idents = getScorableIdentifiers([{ key: STATEMENT_ACTOR_MBOX, value: email }], doc, org, singleMatchedIndexes);
      expect(Object.keys(idents)).to.have.lengthOf(3);
      expect(idents[STATEMENT_ACTOR_MBOX]).to.equal(email);
      expect(idents[STATEMENT_ACTOR_NAME]).to.equal([doc[2], doc[3]].join(' '));
      expect(idents[STATEMENT_ACTOR_ACCOUNT_NAME]).to.equal(doc[0]);
      done();
    });
  });

  describe('setUploadCounts', () => {
    it('should update the import model with counts', (done) => {
      setUploadCounts(modelId, 10, (err, results) => {
        if (err) return done(err);
        expect(results).to.exist;
        expect(results.count).to.equal(10);
        expect(err).to.equal(null);
        done();
      });
    });
  });
});
