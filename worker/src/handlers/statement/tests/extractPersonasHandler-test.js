// /* eslint-disable no-unused-expressions */
// /* eslint-disable no-unused-vars */
// // import logger from 'lib/logger';
// import models from 'lib/models';
// import chai, { expect, assert } from 'chai';
// import async from 'async';
// import PersonaDBHelper from 'lib/classes/PersonasDBHelper';
// import Statement from 'lib/models/statement';
// import { getConnection } from 'lib/connections/mongoose';
// import wrapHandlerForStatement from 'worker/handlers/statement/extractPersonasHandler';
// import boolean from 'boolean';

// chai.should();
// chai.use(require('chai-things'));

// const db = new PersonaDBHelper();

// describe('Extract persona identifiers from statements', () => {
//   before((done) => {
//     const connection = getConnection();
//     if (connection.readyState !== 1) {
//       connection.on('connected', done);
//     } else {
//       done();
//     }
//   });

//   beforeEach('Set up people and statements for testing', (done) => {
//     db.prepare(done);
//   });

//   afterEach('Clear db collections', (done) => {
//     db.cleanUp(done);
//   });

//   describe('statement with no previously seen idents', () => {
//     let statements;
//     const statement1Data = db.getStatementData({
//       statement: {
//         actor: {
//           mbox: 'mailto:neverseen@me.before',
//           name: 'Never Seen'
//         },
//         context: {
//           registration: db.regUUID
//         }
//       }
//     });
//     const statement2Data = db.getStatementData({
//       statement: {
//         actor: {
//           mbox: 'mailto:neverseen@me.be',
//           name: 'Never Seen'
//         }
//       }
//     });
//     beforeEach('create statement', (done) => {
//       async.parallel({
//         s1: sdone => db.createStatement(statement1Data, sdone),
//         s2: sdone => db.createStatement(statement2Data, sdone),
//       }, (err, results) => {
//         if (err) return done(err);
//         statements = results;
//         done();
//       });
//     });

//     it('should create a new persona and personaIdentifier and attach them to the statement1, it should then create a personaIdentifier for statement2 and set the scoredPersonas to that of the first personaIdentifier if persona scoring is enabled, otherwise it should have its own person', (done) => {
//       wrapHandlerForStatement({ statementId: statements.s1._id }, (err) => {
//         if (err) return done(err);
//         Statement.findById(statements.s1._id, (err, updateds1) => {
//           if (err) return done(err);
//           const s1Obj = updateds1.toObject();
//           expect(s1Obj.personaIdentifier).to.not.be.null; //eslint-disable-line
//           expect(s1Obj.person).to.exist;

//           wrapHandlerForStatement({ statementId: statements.s2._id }, (err) => {
//             if (err) return done(err);
//             Statement.findById(statements.s2._id, (err, updateds2) => {
//               const s2Obj = updateds2.toObject();
//               expect(s2Obj.personaIdentifier).to.not.be.null; //eslint-disable-line
//               if (!boolean(process.env.DISABLE_PERSONA_SCORING)) {
//                 console.log('s2obj', s2Obj.person);
//                 assert(!s2Obj.person, 'Persona should not exist on statement 2');
//               } else {
//                 expect(s2Obj.person).to.exist;
//               }
//               done();
//             });
//           });
//         });
//       });
//     });
//   });
// });
