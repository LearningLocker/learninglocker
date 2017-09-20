/* eslint-disable no-unused-expressions */
import logger from 'lib/logger';
import sinon from 'sinon';
import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';
import _ from 'lodash';
import chai, { expect, assert } from 'chai';
import async from 'async';
import Persona from 'lib/models/persona';
import Statement from 'lib/models/statement';
import PersonaIdentifier from 'lib/models/personaidentifier';
import PersonaFinder from 'lib/classes/PersonaFinder';
import PersonaDBHelper from 'lib/classes/PersonasDBHelper';
import {
  SCORABLE_KEY_SETTINGS,
  STATEMENT_ACTOR_MBOX,
  STATEMENT_ACTOR_ACCOUNT,
  STATEMENT_ACTOR_NAME,
  STATEMENT_CONTEXT_REGISTRATION,
  STATEMENT_ACTOR_ACCOUNT_HOMEPAGE,
  STATEMENT_ACTOR_ACCOUNT_NAME
} from 'lib/constants/statements';
import stringScore from 'string-score';
import boolean from 'boolean';

const DISABLE_PERSONA_SCORING = boolean(_.defaultTo(process.env.DISABLE_PERSONA_SCORING, true));

chai.should();
chai.use(require('chai-things'));

const db = new PersonaDBHelper();
describe('Extract persona identifiers from statements', () => {
  const personaFinder = new PersonaFinder();
  before((done) => {
    const connection = getConnection();
    console.log('checking connection....');
    console.log('readyState', connection.readyState);
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

  describe('makeIdent', () => {
    it('should only convert valid idents values to lowercase and order keys', (done) => {
      const account1 = {
        key: STATEMENT_ACTOR_ACCOUNT,
        value: {
          homePage: 'HTTP://ht2.CO.uk',
          name: 'TEST1'
        }
      };

      const account2 = {
        key: STATEMENT_ACTOR_ACCOUNT,
        value: {
          name: 'TEST1',
          homePage: 'HTTP://ht2.CO.uk'
        }
      };

      const ident1 = personaFinder.makeIdent(account1.key, account1.value);
      const ident2 = personaFinder.makeIdent(account2.key, account2.value);

      expect(ident1).to.deep.equal({
        key: STATEMENT_ACTOR_ACCOUNT,
        value: {
          homePage: account1.value.homePage.toLowerCase(),
          name: account1.value.name
        }
      });
      expect(ident2).to.deep.equal({
        key: STATEMENT_ACTOR_ACCOUNT,
        value: {
          homePage: account2.value.homePage.toLowerCase(),
          name: account2.value.name
        }
      });

      const ident1ValueKeys = Object.keys(ident1.value);
      expect(ident1ValueKeys[0]).to.equal('homePage');
      expect(ident1ValueKeys[1]).to.equal('name');

      const ident2ValueKeys = Object.keys(ident2.value);
      expect(ident2ValueKeys[0]).to.equal('homePage');
      expect(ident2ValueKeys[1]).to.equal('name');
      done();
    });
  });

  describe('getIdentValueForScoring', () => {
    it('should clean an mbox ident to remove the mailto:', (done) => {
      const email = 'test@testy.com';
      const mboxIdent = {
        key: STATEMENT_ACTOR_MBOX,
        value: `mailto:${email}`
      };
      const cleanedValue = personaFinder.getIdentValueForScoring(mboxIdent);
      expect(cleanedValue).to.equal(email);
      done();
    });

    it('should return ident value', (done) => {
      const idents = [
        db.accountIdent,
        db.openIdent,
        db.sha1Ident,
        db.registrationIdent,
        db.nameIdent
      ];

      const cleanedValues = _.map(idents, ident =>
        personaFinder.getIdentValueForScoring(ident)
      );
      _.each(cleanedValues, (cleanValue, index) => {
        const checkVal = idents[index].value;
        expect(cleanValue).to.equal(checkVal);
      });
      done();
    });
  });

  describe('processStatementForPersona', () => {
    describe('2 statements with two identical (and not previously seen) idents', () => {
      let statement1;
      let statement2;
      const actor = {
        mbox: 'mailto:neverseen@me.before',
        name: 'Never Seen'
      };
      const statementData = db.getStatementData({
        statement: { actor }
      });
      const statement2Data = db.getStatementData({
        statement: { actor }
      });
      beforeEach('create statement', (done) => {
        db.createStatement(statementData, (err, createdStatement) => {
          statement1 = createdStatement;
          db.createStatement(statement2Data, (err, createdStatement2) => {
            statement2 = createdStatement2;
            done();
          });
        });
      });

      it('should create a new persona and personaIdentifier and attach them to the statement and attach the personaIdentifier to the persona', (done) => {
        personaFinder.processStatementForPersona(statement1, (err, results) => {
          expect(results.persona).to.exist;
          expect(results.personaIdentifier).to.exist;
          expect(results.statement).to.exist;
          expect(results.statement._id).to.deep.equal(statement1._id);
          expect(results.statement.personaIdentifier).to.exist;
          expect(results.statement.personaIdentifier).to.not.be.null; //eslint-disable-line
          Statement.findById(results.statement._id, (err, updatedStatement) => {
            expect(updatedStatement.person._id).to.deep.equal(
              results.persona._id
            );
            expect(updatedStatement.personaIdentifier).to.not.be.null; //eslint-disable-line
            Persona.findById(results.persona, (err, updatedPersona) => {
              expect(
                updatedPersona.toObject().personaIdentifiers
              ).to.deep.include.members([results.personaIdentifier._id]);
              done(err);
            });
          });
        });
      });

      it('should insert two statements in parallel and expect the same persona on both', async (done) => {
        const res = await new Promise((resolve, reject) =>
          async.parallel(
            {
              process1: processDone =>
                personaFinder.processStatementForPersona(statement1, processDone),
              process2: processDone =>
                personaFinder.processStatementForPersona(statement2, processDone)
            },
            (err, res2) => (err ? reject(err) : resolve(res2))
          )
        );
        const process1 = res.process1;
        const process2 = res.process2;

        /*
        Due to race conditions, persona may sometimes be null.
        This is due to if a personaIdentifier is updatedExisting, we asume that something
        is in the process of adding a persona. However, it may not exist in the db at this point
        in time. (see handleScoredData)
        */
        expect(process1.persona || process2.persona).to.exist;
        expect(process1.personaIdentifier).to.exist;
        expect(process1.statement).to.exist;
        expect(process1.statement._id).to.deep.equal(
          statement1._id
        );
        expect(process1.statement.personaIdentifier).to
          .exist;
        expect(process1.statement.personaIdentifier).to.not
          .be.null; //eslint-disable-line

        expect(process2.personaIdentifier).to.exist;
        expect(process2.statement).to.exist;
        expect(process2.statement._id).to.deep.equal(
          statement2._id
        );
        expect(process2.statement.personaIdentifier).to
          .exist;
        expect(process2.statement.personaIdentifier).to.not
          .be.null; //eslint-disable-line

        Statement.findById(
          process1.statement._id,
          (err, updatedStatement1) => {
            expect(updatedStatement1.person._id).to.deep.equal(
              (process1.persona || process2.persona)._id
            );
            expect(updatedStatement1.personaIdentifier).to.not.be.null; //eslint-disable-line

            Statement.findById(
              process2.statement._id,
              (err, updatedStatement2) => {
                expect(updatedStatement2.personaIdentifier).to.not.be.null; //eslint-disable-line
                expect(updatedStatement1.personaIdentifier).to.deep.equal(
                  updatedStatement2.personaIdentifier
                );
                expect(
                  updatedStatement1.person._id.toString()
                ).to.deep.equal(updatedStatement2.person._id.toString());
                done(err);
              }
            );
          }
        );
      });
    });
  });

  describe('get identifiers from statement', () => {
    it('should get a name and mbox from a statement', (done) => {
      const statement = db.statements.mbox;
      personaFinder.getUniqueIdentifierFromStatement(
        statement,
        (err, uniqueIdentifier) => {
          if (err) return done(err);
          expect(uniqueIdentifier).to.deep.equal(db.mboxIdent);

          personaFinder.getOtherIdentifiersFromStatement(
            statement,
            (err, otherIdentifiers) => {
              expect(otherIdentifiers).to.deep.equal(
                [
                  personaFinder.makeIdent(db.mboxIdent.key, db.mboxIdent.value),
                  personaFinder.makeIdent(db.nameIdent.key, db.nameIdent.value)
                ],
                'didnt include the expected name ident'
              );
              done();
            }
          );
        }
      );
    });

    it('should get a name and account from a statement', (done) => {
      const statement = db.statements.account;
      personaFinder.getUniqueIdentifierFromStatement(
        statement,
        (err, uniqueIdentifier) => {
          if (err) return done(err);
          expect(uniqueIdentifier).to.deep.equal(db.accountIdent);
          personaFinder.getOtherIdentifiersFromStatement(
            statement,
            (err, otherIdentifiers) => {
              expect(otherIdentifiers).to.deep.equal(
                [
                  personaFinder.makeIdent(db.nameIdent.key, db.nameIdent.value),
                  personaFinder.makeIdent(
                    db.accountHomepageIdent.key,
                    db.accountHomepageIdent.value
                  ),
                  personaFinder.makeIdent(
                    db.accountNameIdent.key,
                    db.accountNameIdent.value
                  )
                ],
                'didnt include the expected name ident'
              );
              done();
            }
          );
        }
      );
    });

    it('should get a name and OpenId from a statement', (done) => {
      const statement = db.statements.openid;
      personaFinder.getUniqueIdentifierFromStatement(
        statement,
        (err, uniqueIdentifier) => {
          if (err) return done(err);
          expect(uniqueIdentifier).to.deep.equal(db.openIdent);
          personaFinder.getOtherIdentifiersFromStatement(
            statement,
            (err, otherIdentifiers) => {
              expect(otherIdentifiers).to.deep.equal(
                [
                  personaFinder.makeIdent(db.openIdent.key, db.openIdent.value),
                  personaFinder.makeIdent(db.nameIdent.key, db.nameIdent.value)
                ],
                'didnt include the expected name ident'
              );
              done();
            }
          );
        }
      );
    });

    it('should get a name and MboxSha1Sum from a statement', (done) => {
      const statement = db.statements.mbox_sha1sum;
      personaFinder.getUniqueIdentifierFromStatement(
        statement,
        (err, uniqueIdentifier) => {
          if (err) return done(err);
          expect(uniqueIdentifier).to.deep.equal(db.sha1Ident);
          personaFinder.getOtherIdentifiersFromStatement(
            statement,
            (err, otherIdentifiers) => {
              expect(otherIdentifiers).to.deep.contains.members(
                [personaFinder.makeIdent(db.nameIdent.key, db.nameIdent.value)],
                'didnt include the expected name ident'
              );
              done();
            }
          );
        }
      );
    });

    describe('registration statement', () => {
      let regStatement;
      const regId = '000001';
      const statementData = db.getStatementData({
        statement: {
          context: { registration: regId }
        }
      });

      before('setup registration statement', (done) => {
        db.createStatement(statementData, (err, model) => {
          if (err) return done(err);
          regStatement = model;
          done();
        });
      });

      after('setup registration statement', (done) => {
        db.cleanModels([Statement], done, { _id: regStatement._id });
      });

      it('should get a name, mbox and registration from a statement', (done) => {
        const statement = regStatement;
        const regIdent = {
          key: STATEMENT_CONTEXT_REGISTRATION,
          value: regId
        };
        const expectedUnique = db.mboxIdent;
        const expectedOthers = [
          personaFinder.makeIdent(db.mboxIdent.key, db.mboxIdent.value),
          personaFinder.makeIdent(regIdent.key, regIdent.value),
          personaFinder.makeIdent(db.nameIdent.key, db.nameIdent.value)
        ];
        personaFinder.getUniqueIdentifierFromStatement(
          statement,
          (err, uniqueIdentifier) => {
            if (err) return done(err);
            expect(uniqueIdentifier).to.deep.equal(expectedUnique);

            personaFinder.getOtherIdentifiersFromStatement(
              statement,
              (err, otherIdentifiers) => {
                expect(otherIdentifiers).to.deep.contain.members(
                  expectedOthers,
                  'didnt include the expected name and registatration idents'
                );
                done();
              }
            );
          }
        );
      });
    });
  });

  describe('findOrCreatePersonaIdentifier', () => {
    const mboxIdentifier = {
      key: STATEMENT_ACTOR_MBOX,
      value: 'mailto:unique@example.com'
    };
    const nameIdentifier = {
      key: STATEMENT_ACTOR_NAME,
      value: 'Example Learner'
    };
    const regIdentifier = {
      key: STATEMENT_CONTEXT_REGISTRATION,
      value: 'Reg00000000001'
    };

    let personaIdentifier;

    beforeEach('Set up persona identifier', (done) => {
      db.createPersonaIdentifier(
        db.getPersonaIdentifierData({
          uniqueIdentifier: mboxIdentifier,
          identifiers: [nameIdentifier]
        }),
        (err, model) => {
          if (err) throw err;
          personaIdentifier = model;
          done();
        }
      );
    });

    afterEach('Clean up persona identifier', (done) => {
      db.cleanupPersonaIdentifiers(done);
    });

    it('should make a new personaIdentifier', (done) => {
      const newMboxIdentifier = {
        value: 'mailto:newMboxIdentifier@example.com',
        key: STATEMENT_ACTOR_MBOX
      };

      try {
        personaFinder.findOrCreatePersonaIdentifier(
          db.organisation._id,
          newMboxIdentifier,
          [db.nameIdent],
          (err, model, created) => {
            expect(err).to.be.falsy;
            expect(model.uniqueIdentifier.toJSON()).to.deep.equal(
              newMboxIdentifier
            );
            expect(model.identifiers).to.have.lengthOf(1);
            expect(model.toJSON().identifiers).to.have.deep.property(
              '[0].value',
              db.nameIdent.value
            );
            expect(model.toJSON().identifiers).to.have.deep.property(
              '[0].key',
              db.nameIdent.key
            );
            expect(created).to.be.truthy;
            done();
          }
        );
      } catch (e) {
        done(e);
      }
    });

    it('should return a single existing personaIdentifier with an added identifier', (done) => {
      try {
        personaFinder.findOrCreatePersonaIdentifier(
          db.organisation._id,
          mboxIdentifier,
          [regIdentifier],
          (err, model) => {
            expect(err).to.be.falsy;
            const expectedIdents = [nameIdentifier, regIdentifier];
            expect(model.toJSON().uniqueIdentifier).to.deep.equal(
              personaIdentifier.toJSON().uniqueIdentifier
            );
            expect(model.toJSON().identifiers).to.deep.include.members(
              expectedIdents
            );
            done();
          }
        );
      } catch (e) {
        done(e);
      }
    });

    it('should return a single existing personaIdentifier when run on 2 statements in parallel', (done) => {
      try {
        async.parallel(
          {
            find1: findDone =>
              personaFinder.findOrCreatePersonaIdentifier(
                db.organisation._id,
                personaIdentifier.uniqueIdentifier,
                [nameIdentifier],
                findDone
              ),
            find2: findDone =>
              personaFinder.findOrCreatePersonaIdentifier(
                db.organisation._id,
                personaIdentifier.uniqueIdentifier,
                [],
                findDone
              )
          },
          (err, results) => {
            expect(err).to.be.falsy;

            // check that the IDs equal each other (the identifiers may be different at this point)
            expect(results.find1.toJSON()._id).to.deep.equal(
              results.find2.toJSON()._id
            );

            // check that the idents for both are as expected
            expect(results.find1.toJSON().uniqueIdentifier).to.deep.equal(
              personaIdentifier.toJSON().uniqueIdentifier
            );
            expect(results.find2.toJSON().uniqueIdentifier).to.deep.equal(
              personaIdentifier.toJSON().uniqueIdentifier
            );
            done();
          }
        );
      } catch (e) {
        done(e);
      }
    });

    it('should make a single new personaIdentifier when run on 2 statements in parallel', (done) => {
      try {
        const newMboxIdentifier = {
          value: 'mailto:newMboxIdentifier@example.com',
          key: STATEMENT_ACTOR_MBOX
        };
        const newNameIdentifier = {
          value: 'New Learner',
          key: STATEMENT_ACTOR_NAME
        };

        const idents = [newNameIdentifier];

        async.parallel(
          {
            findorCreate1: findDone =>
              personaFinder.findOrCreatePersonaIdentifier(
                db.organisation._id,
                newMboxIdentifier,
                idents,
                findDone
              ),
            findorCreate2: findDone =>
              personaFinder.findOrCreatePersonaIdentifier(
                db.organisation._id,
                newMboxIdentifier,
                [db.registrationIdent],
                findDone
              )
          },
          (err, results) => {
            expect(err).to.be.falsy;
            const findorCreate1Json = results.findorCreate1.toJSON();
            const findorCreate2Json = results.findorCreate2.toJSON();

            // check that the IDs equal each other (the identifiers may be different at this point)
            expect(findorCreate1Json._id).to.deep.equal(findorCreate2Json._id);

            // check that the idents for both are as expected
            expect(findorCreate1Json.uniqueIdentifier).to.deep.equal(
              newMboxIdentifier
            );
            expect(findorCreate2Json.uniqueIdentifier).to.deep.equal(
              newMboxIdentifier
            );
            done();
          }
        );
      } catch (e) {
        done(e);
      }
    });
  });

  describe('assignPersonaToStatement', () => {
    const models = {};
    const statementData = db.getStatementData({});
    const personaData = db.getPersonaData({});
    const personaIdentifierData = db.getPersonaIdentifierData({});

    before('create statement, persona and personaIdentifier', (done) => {
      async.waterfall(
        [
          next =>
            db.createStatement(statementData, (err, statement) => {
              personaIdentifierData.statements.push(statement._id);
              next(err, { statement });
            }),
          ({ ...others }, next) =>
            db.createPersonaIdentifier(
              personaIdentifierData,
              (err, personaIdentifier) => {
                next(err, { personaIdentifier, ...others });
              }
            ),
          ({ ...others }, next) =>
            db.createPersona(personaData, (err, persona) => {
              next(err, { persona, ...others });
            })
        ],
        (err, { persona, personaIdentifier, statement }) => {
          if (err) done(err);
          models.statement = statement;
          models.persona = persona;
          models.personaIdentifier = personaIdentifier;
          done();
        }
      );
    });

    after('cleanup', (done) => {
      db.cleanModels([Persona, Statement, PersonaIdentifier], done);
    });

    it('should add a person to the statement and remove the statement from the personaIdentifier', (done) => {
      try {
        personaFinder.assignPersonaToStatement(models, (err) => {
          if (err) throw err;

          Statement.findById(models.statement._id, (err, statement) => {
            if (err) throw err;
            expect(statement.toJSON().person._id).to.deep.equal(
              models.persona._id
            );
            expect(statement.toJSON().personaIdentifier).to.deep.equal(
              models.personaIdentifier._id
            );
            done();
          });
        });
      } catch (e) {
        logger.error(e);
        done(e);
      }
    });
  });

  describe('assignPersonaIdentifierToStatement', () => {
    const models = {};
    const statementData = db.getStatementData({});
    const personaIdentifierData = db.getPersonaIdentifierData({});

    before('create statement, persona and personaIdentifier', (done) => {
      async.waterfall(
        [
          next =>
            db.createStatement(statementData, (err, statement) => {
              next(err, { statement });
            }),
          ({ ...others }, next) =>
            db.createPersonaIdentifier(
              personaIdentifierData,
              (err, personaIdentifier) => {
                next(err, { personaIdentifier, ...others });
              }
            )
        ],
        (err, { personaIdentifier, statement }) => {
          if (err) done(err);
          models.statement = statement;
          models.personaIdentifier = personaIdentifier;
          done();
        }
      );
    });

    after('cleanup', (done) => {
      db.cleanModels([Statement, PersonaIdentifier], done);
    });

    it('should insert a the id of a statement into the personaIdentifier', (done) => {
      personaFinder.assignPersonaIdentifierToStatement(
        {
          statement: models.statement,
          personaIdentifier: models.personaIdentifier
        },
        (err, { statement }) => {
          if (err) return done(err);
          expect(statement.personaIdentifier.toString()).to.deep.equal(
            models.personaIdentifier._id.toString()
          );
          done();
        }
      );
    });
  });

  describe('getScoredPersonas', () => {
    let models;

    const account1Ident = {
      key: STATEMENT_ACTOR_ACCOUNT,
      value: { homePage: 'http://example.org', name: 'test001' }
    };
    const account2Ident = {
      key: STATEMENT_ACTOR_ACCOUNT,
      value: { homePage: 'http://somethingelse.com', name: 'test001' }
    };
    const account3Ident = {
      key: STATEMENT_ACTOR_ACCOUNT,
      value: { homePage: 'http://badger.net', name: 'test001' }
    };

    const looseAccountIdent = {
      key: STATEMENT_ACTOR_ACCOUNT,
      value: { homePage: 'http://www.somethingelse.com', name: 'test001' }
    };

    const reg1Ident = {
      key: STATEMENT_CONTEXT_REGISTRATION,
      value: '123456'
    };
    const reg2Ident = {
      key: STATEMENT_CONTEXT_REGISTRATION,
      value: '78901'
    };
    const accountNameIdent = {
      key: STATEMENT_ACTOR_ACCOUNT_NAME,
      value: 'test001'
    };
    const account1HomepageIdent = {
      key: STATEMENT_ACTOR_ACCOUNT_HOMEPAGE,
      value: account1Ident.value.homePage
    };
    const account2HomepageIdent = {
      key: STATEMENT_ACTOR_ACCOUNT_HOMEPAGE,
      value: account2Ident.value.homePage
    };

    const looseAccountHomepageIdent = {
      key: STATEMENT_ACTOR_ACCOUNT_HOMEPAGE,
      value: looseAccountIdent.value.homePage
    };
    beforeEach('setup db', (done) => {
      async.parallel(
        {
          account1WithNameAndRegPI: insertDone =>
            db.createPersonaIdentifier(
              db.getPersonaIdentifierData({
                uniqueIdentifier: account1Ident,
                identifiers: [accountNameIdent, account1HomepageIdent]
              }),
              insertDone
            ),
          looseMatchOnHomepage: insertDone =>
            db.createPersonaIdentifier(
              db.getPersonaIdentifierData({
                uniqueIdentifier: looseAccountIdent,
                identifiers: [accountNameIdent, looseAccountHomepageIdent]
              }),
              insertDone
            ),
          mboxWithNamePI: insertDone =>
            db.createPersonaIdentifier(
              db.getPersonaIdentifierData({
                uniqueIdentifier: db.mboxIdent,
                identifiers: [db.nameIdent, reg1Ident, reg2Ident],
                persona: db.persona._id
              }),
              insertDone
            ),
          openIdentwithRegPI: insertDone =>
            db.createPersonaIdentifier(
              db.getPersonaIdentifierData({
                uniqueIdentifier: db.openIdent,
                identifiers: [db.registrationIdent, reg1Ident],
                persona: db.persona2._id
              }),
              insertDone
            ),
          account2WithNamePI: insertDone =>
            db.createPersonaIdentifier(
              db.getPersonaIdentifierData({
                uniqueIdentifier: account2Ident,
                identifiers: [
                  accountNameIdent,
                  account2HomepageIdent,
                  db.nameIdent,
                  reg2Ident
                ],
                persona: db.persona3._id
              }),
              insertDone
            )
          // account3WithRegPI: (insertDone) => db.createPersonaIdentifier(db.getPersonaIdentifierData({uniqueIdentifier: account3Ident, identifiers: [accountNameIdent, db.nameIdent, db.registrationIdent], persona: db.persona3._id}), insertDone),
        },
        (err, res) => {
          if (err) return done(err);
          models = res;
          done();
        }
      );
    });

    afterEach('setup db', (done) => {
      done();
    });

    it('should return scored personas identified by name, registration and account name', (done) => {
      const pi = models.account1WithNameAndRegPI;
      personaFinder.findRelatedPersonaIdentifiers(pi, (err, foundPIs) => {
        personaFinder.scoreFoundPersonaIdentifiers(
          foundPIs,
          pi,
          (err, scoreData) => {
            if (err) return done(err);
            const expectedHomepageScore =
              stringScore(
                account1HomepageIdent.value,
                account2HomepageIdent.value,
                0.5
              ).toFixed(2) *
              SCORABLE_KEY_SETTINGS[STATEMENT_ACTOR_ACCOUNT_HOMEPAGE].score;
            expect(scoreData.suggestedPersonas).to.deep.equal([
              {
                matches: [
                  _.assign({}, accountNameIdent, {
                    score: SCORABLE_KEY_SETTINGS[STATEMENT_ACTOR_ACCOUNT_NAME]
                      .score,
                    comparedValue: accountNameIdent.value
                  }),
                  _.assign({}, account1HomepageIdent, {
                    score: expectedHomepageScore,
                    comparedValue: account2HomepageIdent.value
                  })
                ],
                persona: db.persona3._id.toString(),
                score: SCORABLE_KEY_SETTINGS[STATEMENT_ACTOR_ACCOUNT_NAME]
                  .score + expectedHomepageScore
              }
            ]);
            expect(scoreData.matchedPersona).to.be.null;
            done();
          }
        );
      });
    });

    it('should match a persona', (done) => {
      db.createPersonaIdentifier(
        db.getPersonaIdentifierData({
          uniqueIdentifier: account3Ident,
          identifiers: [db.nameIdent, reg1Ident, reg2Ident]
        }),
        (err, newPersonaIdentifier) => {
          personaFinder.findRelatedPersonaIdentifiers(
            newPersonaIdentifier,
            (err, foundPIs) => {
              personaFinder.scoreFoundPersonaIdentifiers(
                foundPIs,
                newPersonaIdentifier,
                (err, scoreData) => {
                  expect(
                    scoreData.matchedPersona.persona.toJSON()._id
                  ).to.deep.equal(db.persona.toJSON()._id);
                  done();
                }
              );
            }
          );
        }
      );
    });
  });

  describe('getPersonaFromPersonaIdentifier', () => {
    /**
    * We can get away with just testing that the flow for this method is correct.
    * The two methods utlised are tested through their own unit tests
    */
    describe('mock the internal methods', () => {
      it('should call on getPersonaFromUniqueIdentifiers and getScoredPersonas if no persona is on the identifier is found', (done) => {
        const spiedPersonaFinder = new PersonaFinder();
        const scoredSpy = sinon.stub(
          spiedPersonaFinder,
          'getScoredFromAllPersonaIdents',
          (personaIdentifier, next) => {
            next();
          }
        );

        const personaIdentifier = {
          identifiers: ['foo'],
          persona: null,
          organisation: db.orgId
        };
        spiedPersonaFinder.getPersonaFromPersonaIdentifier(
          personaIdentifier,
          (err) => {
            if (err) return done(err);
            // Check that the correct methods are called (or not)
            if (!DISABLE_PERSONA_SCORING) {
              assert(
                scoredSpy.calledOnce,
                'getScoredFromAllPersonaIdents was not called'
              );
            }
            done();
          }
        );
      });

      it('should call on getPersonaFromUniqueIdentifiers but skip getScoredPersonas if a matchedPersona exists on the identifier', (done) => {
        const spiedPersonaFinder = new PersonaFinder();

        const scoredSpy = sinon.spy(
          spiedPersonaFinder,
          'getScoredFromAllPersonaIdents'
        );

        const personaIdentifier = {
          identifiers: null,
          persona: db.persona._id
        };
        spiedPersonaFinder.getPersonaFromPersonaIdentifier(
          personaIdentifier,
          (err, data) => {
            if (err) return done(err);
            // Check that the correct methods are called (or not)
            assert(
              !scoredSpy.calledOnce,
              'getScoredFromAllPersonaIdents was called'
            );

            // Check the returned data
            expect(data.personaIdentifier).to.deep.equal(personaIdentifier);
            expect(data.matchedPersona.persona.toJSON()).to.deep.equal(
              db.persona.toJSON()
            );
            expect(data.suggestedPersonas).to.deep.equal([]);
            done();
          }
        );
      });
    });
  });

  describe('assignSuggestedPersonasToPersonaIdentifier', () => {
    let models;
    before('create personaIdentifier', (done) => {
      async.parallel(
        {
          mboxPersona: insertDone =>
            db.createPersona({ name: 'Mbox' }, insertDone),
          namePersona: insertDone =>
            db.createPersona({ name: 'Test name' }, insertDone),
          accountPersona: insertDone =>
            db.createPersona({ name: 'Account' }, insertDone),
          personaIdentifier: insertDone =>
            db.createPersonaIdentifier(
              db.getPersonaIdentifierData({
                uniqueIdentifier: db.mboxIdent,
                identifiers: [db.nameIdent]
              }),
              insertDone
            )
        },
        (err, res) => {
          models = res;
          done(err);
        }
      );
    });

    after('clean up', (done) => {
      db.cleanModels([PersonaIdentifier], done);
    });

    it('should update the provided personaIdentifier with suggestedPersonas', (done) => {
      try {
        const suggestedPersonas = [
          { persona: models.mboxPersona._id, score: 3, matches: [] },
          { persona: models.namePersona._id, score: 4, matches: [] }
        ];
        personaFinder.assignSuggestedPersonasToPersonaIdentifier(
          { personaIdentifier: models.personaIdentifier, suggestedPersonas },
          (err, updatedPersonaIdentifier) => {
            if (err) throw err;
            const jsonRes = updatedPersonaIdentifier.toJSON();

            const scores = _.map(jsonRes.personaScores, ps =>
              _.assign(ps, { persona: ps.persona.toString() })
            );

            scores.should.contain.a.thing.with.property(
              'persona',
              suggestedPersonas[1].persona.toString()
            );
            scores.should.contain.a.thing.with.property(
              'persona',
              suggestedPersonas[0].persona.toString()
            );

            scores.should.contain.a.thing.with.property('score', 3);
            scores.should.contain.a.thing.with.property('score', 4);
            expect(scores).to.have.lengthOf(2);
            done();
          }
        );
      } catch (e) {
        done(e);
      }
    });
  });

  describe('createPersonaFromPersonaIdentifier', () => {
    let statement;
    let mboxPersonaIdentifier;
    beforeEach('create statement with personaIdentifier attached', (done) => {
      db.createPersonaIdentifier(
        db.getPersonaIdentifierData({
          uniqueIdentifier: db.mboxIdent,
          identifiers: [db.nameIdent]
        }),
        (err, pi) => {
          mboxPersonaIdentifier = pi;
          const statementData = db.getStatementData({
            personaIdentifier: mboxPersonaIdentifier._id
          });
          db.createStatement(statementData, (err, model) => {
            if (err) return done(err);
            statement = model;
            done();
          });
        }
      );
    });

    afterEach('remove statement', (done) => {
      db.cleanModels([Statement], done, { _id: statement._id });
    });

    it('should create a new persona and update the statements to point to the person', (done) => {
      const personaIdentifier = mboxPersonaIdentifier;
      personaFinder.createPersonaFromPersonaIdentifier(
        personaIdentifier,
        (err, data) => {
          if (err) return done(err);
          expect(data.personaIdentifier).to.deep.equal(personaIdentifier);
          expect(data.persona).to.not.be.null; //eslint-disable-line
          // should take the name from the mboxIdentifiers name ident value
          expect(data.persona.name).to.equal(db.nameIdent.value);

          Statement.find(
            { personaIdentifier: personaIdentifier._id },
            (err, statements) => {
              _.each(statements, (s) => {
                assert(
                  _.has(s.toJSON().person, '_id'),
                  'Person does not have _id'
                );
                expect(s.toJSON().person._id.toString()).to.deep.equal(
                  data.persona._id.toString()
                );
              });
              done();
            }
          );
        }
      );
    });
  });

  describe('checkForSimilarFromAttachedPersonaIdentifier', () => {
    let models;
    const ident1 = {
      key: STATEMENT_ACTOR_MBOX,
      value: 'mailto:badger@badger.badger'
    };
    const ident2 = {
      key: STATEMENT_ACTOR_MBOX,
      value: 'mailto:b@dger.badger'
    };
    const ident3 = {
      key: STATEMENT_ACTOR_MBOX,
      value: 'mailto:bodger@bodger.badger'
    };

    const badgerName = {
      key: STATEMENT_ACTOR_NAME,
      value: 'Mr Badger'
    };

    const unrelatedIdent = {
      key: STATEMENT_ACTOR_MBOX,
      value: 'mailto:snake@snake.snake'
    };

    beforeEach('Create personas and related/unrelated idents', (done) => {
      async.parallel(
        {
          persona: insertDone =>
            db.createPersona(db.getPersonaData({ name: 'Badger' }), insertDone),

          pi1: insertDone =>
            db.createPersonaIdentifier(
              db.getPersonaIdentifierData({
                uniqueIdentifier: ident1,
                identifiers: [badgerName]
              }),
              insertDone
            ),
          pi2: insertDone =>
            db.createPersonaIdentifier(
              db.getPersonaIdentifierData({
                uniqueIdentifier: ident2,
                identifiers: [badgerName]
              }),
              insertDone
            ),
          pi3: insertDone =>
            db.createPersonaIdentifier(
              db.getPersonaIdentifierData({
                uniqueIdentifier: ident3,
                identifiers: [badgerName]
              }),
              insertDone
            ),
          unrelatedPI: insertDone =>
            db.createPersonaIdentifier(
              db.getPersonaIdentifierData({ uniqueIdentifier: unrelatedIdent }),
              insertDone
            )
        },
        (err, res) => {
          if (err) return done(err);
          models = res;

          models.pi1.persona = models.persona._id;
          models.pi1.save((err, updatedPI) => {
            if (err) return done(err);
            models.pi1 = updatedPI;
            done();
          });
        }
      );
    });
  });

  describe('handlePersonaIdentifierForStatement', () => {
    let models;
    const ident1 = {
      key: STATEMENT_ACTOR_MBOX,
      value: 'mailto:badger@badger.badger'
    };
    const ident2 = {
      key: STATEMENT_ACTOR_MBOX,
      value: 'mailto:mole@mole.mole'
    };
    const unrelatedIdent = {
      key: STATEMENT_ACTOR_MBOX,
      value: 'mailto:snake@snake.snake'
    };
    const ident1StatementData = db.getStatementData({
      statement: {
        actor: {
          mbox: ident1.value
        }
      }
    });
    const unrelatedStatementData = db.getStatementData({
      statement: {
        actor: {
          mbox: unrelatedIdent.value
        }
      }
    });
    const objectId = new mongoose.Types.ObjectId();

    beforeEach('Create personas and related/unrelated idents', (done) => {
      async.parallel(
        {
          persona: insertDone =>
            db.createPersona(db.getPersonaData({ name: 'Badger' }), insertDone),
          statement: insertDone =>
            db.createStatement(ident1StatementData, insertDone),
          statement2: insertDone =>
            db.createStatement(unrelatedStatementData, insertDone),
          pi1: insertDone =>
            db.createPersonaIdentifier(
              db.getPersonaIdentifierData({ uniqueIdentifier: ident1 }),
              insertDone
            ),
          pi2: insertDone =>
            db.createPersonaIdentifier(
              db.getPersonaIdentifierData({
                uniqueIdentifier: ident2,
                persona: objectId
              }),
              insertDone
            ),
          unrelatedPI: insertDone =>
            db.createPersonaIdentifier(
              db.getPersonaIdentifierData({ uniqueIdentifier: unrelatedIdent }),
              insertDone
            )
        },
        (err, res) => {
          if (err) return done(err);
          models = res;
          models.pi1.persona = models.persona._id;
          models.pi1.save((err, updatedPI) => {
            if (err) return done(err);
            models.pi1 = updatedPI;
            done();
          });
        }
      );
    });

    it('should call on assignPersonaToStatement where a persona exists on the personaIdentifier and is valid', (done) => {
      const spiedPersonaFinder = new PersonaFinder();
      const assignSpy = sinon.stub(
        spiedPersonaFinder,
        'assignPersonaToStatement',
        (data, next) => {
          next(null, {
            persona: models.persona,
            personaIdentifier: models.pi1,
            statement: models.statement
          });
        }
      );

      spiedPersonaFinder.handlePersonaIdentifierForStatement(
        { personaIdentifier: models.pi1, statement: models.statement },
        (err) => {
          if (err) return done(err);
          // Check that the correct methods are called (or not)
          assert(
            assignSpy.calledOnce,
            'assignPersonaToStatement was not called'
          );
          const stubCall = assignSpy.getCall(0);
          expect(stubCall.args[0].personaIdentifier).to.exist;
          expect(stubCall.args[0].persona).to.exist;
          expect(stubCall.args[0].statement).to.exist;
          expect(stubCall.args[0].persona._id).to.deep.equal(
            models.persona._id
          );
          expect(stubCall.args[0].personaIdentifier._id).to.deep.equal(
            models.pi1._id
          );
          expect(stubCall.args[0].statement._id).to.deep.equal(
            models.statement._id
          );
          done();
        }
      );
    });

    it('should call on handlePersonaIdentifierWithNoPersona where a persona exists on the personaIdentifier but not in the db', (done) => {
      const spiedPersonaFinder = new PersonaFinder();
      const assignSpy = sinon.stub(
        spiedPersonaFinder,
        'handlePersonaIdentifierWithNoPersona',
        (data, next) => {
          next(null, { persona: null, personaIdentifier: models.pi2 });
        }
      );

      spiedPersonaFinder.handlePersonaIdentifierForStatement(
        { personaIdentifier: models.pi2, statement: models.statement },
        (err) => {
          if (err) return done(err);
          // Check that the correct methods are called (or not)
          assert(
            assignSpy.calledOnce,
            'handlePersonaIdentifierWithNoPersona was not called'
          );
          const stubCall = assignSpy.getCall(0);
          expect(stubCall.args[0].personaIdentifier).to.exist;
          expect(stubCall.args[0].personaIdentifier.persona).to.be.null;
          done();
        }
      );
    });

    it('should call on handlePersonaIdentifierWithNoPersona where a no persona exists on the personaIdentifier', (done) => {
      const spiedPersonaFinder = new PersonaFinder();
      const handleSpy = sinon.stub(
        spiedPersonaFinder,
        'handlePersonaIdentifierWithNoPersona',
        (data, next) => {
          next(null, { persona: null, personaIdentifier: models.pi2 });
        }
      );

      spiedPersonaFinder.handlePersonaIdentifierForStatement(
        { personaIdentifier: models.pi2, statement: models.statement },
        (err) => {
          if (err) return done(err);
          // Check that the correct methods are called (or not)
          assert(
            handleSpy.calledOnce,
            'handlePersonaIdentifierWithNoPersona was not called'
          );
          const handleCall = handleSpy.getCall(0);
          expect(handleCall.args[0].personaIdentifier).to.exist;
          expect(handleCall.args[0].personaIdentifier.persona).to.be.null;
          done();
        }
      );
    });
  });

  describe('handlePersonaIdentifierWithNoPersona', () => {
    it('should call assignPersonaToPersonaIdentifier with persona and personaIdentifier when a matched persona is returned from getPersonaFromPersonaIdentifier', (done) => {
      const spiedPersonaFinder = new PersonaFinder();

      const getPersonaSpy = sinon.stub(
        spiedPersonaFinder,
        'getPersonaFromPersonaIdentifier',
        (personaIdentifier, next) => {
          next(null, { matchedPersona: { persona: db.persona, matches: [] } });
        }
      );

      const personaIdentifier = {
        identifiers: ['foo'],
        isExisting: true,
        _id: '5703860ba1b798b45bc73683'
      };
      const assignSpy = sinon.stub(
        spiedPersonaFinder,
        'assignPersonaToPersonaIdentifier',
        (data, next) => {
          // mock the callback made by assign...
          next(null, { personaIdentifier, persona: db.persona });
        }
      );

      spiedPersonaFinder.handlePersonaIdentifierWithNoPersona(
        { personaIdentifier, statement: db.mboxStatement },
        (err) => {
          if (err) return done(err);
          // Check that the correct methods are called (or not)
          assert(
            getPersonaSpy.calledOnce,
            'getPersonaFromPersonaIdentifier was not called'
          );
          assert(
            assignSpy.calledOnce,
            'assignPersonaToPersonaIdentifier was not called'
          );

          const assignCall = assignSpy.getCall(0);
          expect(assignCall.args[0].persona).to.exist;
          expect(assignCall.args[0].personaIdentifier).to.exist;
          expect(assignCall.args[0].persona).to.deep.equal(db.persona);
          expect(assignCall.args[0].personaIdentifier).to.deep.equal(
            personaIdentifier
          );
          done();
        }
      );
    });

    it('should call assignSuggestedPersonasToPersonaIdentifier with suggestedPersonas and personaIdentifier when NO matched persona is returned from getPersonaFromPersonaIdentifier', (done) => {
      const spiedPersonaFinder = new PersonaFinder();

      const suggestedPersonas = [{ persona: db.persona._id, score: 3 }];
      const getPersonaSpy = sinon.stub(
        spiedPersonaFinder,
        'getPersonaFromPersonaIdentifier',
        (personaIdentifier, next) => {
          // mock returning NO matchedPersona
          next(null, { matchedPersona: null, suggestedPersonas });
        }
      );

      const personaIdentifier = {
        identifiers: ['foo'],
        isExisting: false,
        _id: '5703860ba1b798b45bc73683'
      };
      const assignSpy = sinon.stub(
        spiedPersonaFinder,
        'assignSuggestedPersonasToPersonaIdentifier',
        (data, next) => {
          // mock the callback made by assign...
          next(null, { personaIdentifier, persona: db.persona });
        }
      );

      spiedPersonaFinder.handlePersonaIdentifierWithNoPersona(
        { personaIdentifier, statement: db.mboxStatement },
        (err) => {
          if (err) return done(err);
          // Check that the correct methods are called (or not)
          assert(
            getPersonaSpy.calledOnce,
            'getPersonaFromPersonaIdentifier was not called'
          );
          assert(
            assignSpy.calledOnce,
            'assignSuggestedPersonasToPersonaIdentifier was not called'
          );

          const assignCall = assignSpy.getCall(0);
          expect(assignCall.args[0].personaIdentifier).to.exist;
          expect(assignCall.args[0].suggestedPersonas).to.exist;
          expect(assignCall.args[0].personaIdentifier).to.deep.equal(
            personaIdentifier
          );
          expect(assignCall.args[0].suggestedPersonas).to.deep.equal(
            suggestedPersonas
          );
          done();
        }
      );
    });

    it('should call createPersonaFromPersonaIdentifier with personaIdentifier when NO matched persona and NO suggestedPersonas are returned from getPersonaFromPersonaIdentifier', (done) => {
      const spiedPersonaFinder = new PersonaFinder();

      const suggestedPersonas = [];
      const getPersonaSpy = sinon.stub(
        spiedPersonaFinder,
        'getPersonaFromPersonaIdentifier',
        (personaIdentifier, next) => {
          // mock returning NO matchedPersona
          next(null, { matchedPersona: null, suggestedPersonas });
        }
      );

      const personaIdentifier = {
        identifiers: ['foo'],
        isExisting: false,
        _id: '5703860ba1b798b45bc73683'
      };
      const assignSpy = sinon.stub(
        spiedPersonaFinder,
        'createPersonaFromPersonaIdentifier',
        (data, next) => {
          // mock the callback made by assign...
          next(null, { personaIdentifier, persona: db.persona });
        }
      );

      spiedPersonaFinder.handlePersonaIdentifierWithNoPersona(
        { personaIdentifier, statement: db.mboxStatement },
        (err) => {
          if (err) return done(err);
          // Check that the correct methods are called (or not)
          assert(
            getPersonaSpy.calledOnce,
            'getPersonaFromPersonaIdentifier was not called'
          );
          assert(
            assignSpy.calledOnce,
            'createPersonaFromPersonaIdentifier was not called'
          );

          const assignCall = assignSpy.getCall(0);
          expect(assignCall.args[0]).to.exist;
          expect(assignCall.args[0]).to.deep.equal(personaIdentifier);
          done();
        }
      );
    });
  });
});
