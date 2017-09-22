import 'lib/models/client'; // something deeper in this suite needs client to be registered
import Persona from 'lib/models/persona';
import Statement from 'lib/models/statement';
import PersonaIdentifier from 'lib/models/personaidentifier';
import Organisation from 'lib/models/organisation';
import ScoringScheme from 'lib/models/scoringscheme';
import Lrs from 'lib/models/lrs';
import {
  STATEMENT_ACTOR_MBOX,
  STATEMENT_ACTOR_ACCOUNT,
  STATEMENT_ACTOR_SHA1SUM,
  STATEMENT_ACTOR_OPENID,
  STATEMENT_ACTOR_NAME,
  STATEMENT_CONTEXT_REGISTRATION,
  STATEMENT_ACTOR_ACCOUNT_NAME,
  STATEMENT_ACTOR_ACCOUNT_HOMEPAGE,
} from 'lib/constants/statements';
import async from 'async';
import _ from 'lodash';

export default class PersonasDBHelper {
  lrsId = '5703860ba1b798b45bc73683';
  orgId = '56fbb868f1ec870140f0f9f8';
  clientId = '56093359f26e8f31ec48aad1';
  regUUID = '7dbcaf33-4155-4d73-a4b5-756cfcb41f49';

  mboxIdent = {
    key: STATEMENT_ACTOR_MBOX,
    value: 'mailto:learner@example.com',
  };
  accountIdent = {
    key: STATEMENT_ACTOR_ACCOUNT,
    value: { homePage: 'http://example.org', name: 'test001' },
  };
  accountNameIdent = {
    key: STATEMENT_ACTOR_ACCOUNT_NAME,
    value: 'test001',
  };
  accountHomepageIdent = {
    key: STATEMENT_ACTOR_ACCOUNT_HOMEPAGE,
    value: 'http://example.org',
  };
  sha1Ident = {
    key: STATEMENT_ACTOR_SHA1SUM,
    value: '8602cbb463ff7df546e420e47c5e94eca5026d81',
  };
  openIdent = {
    key: STATEMENT_ACTOR_OPENID,
    value: 'http://example.org/test001',
  };
  registrationIdent = {
    key: STATEMENT_CONTEXT_REGISTRATION,
    value: this.regUUID,
  };
  nameIdent = {
    key: STATEMENT_ACTOR_NAME,
    value: 'Example Learner',
  };

  /**
   * Remove all models from an array of schemas
   */
  cleanModels = (models, done, query = {}) => {
    async.forEach(models, (model, doneDeleting) => {
      model.remove(query, doneDeleting);
    }, done);
  }

  getPersonaIdentifierData = data => _.defaults(data, {
    organisation: this.orgId,
    persona: null,
    personaScores: [],
    uniqueIdentifier: null,
    identifiers: [],
    statements: []
  });
  createPersonaIdentifier = (data = this.getPersonaIdentifierData(), done) => PersonaIdentifier.create(data, done)
  cleanupPersonaIdentifiers = done => this.cleanModels([PersonaIdentifier], done)

  getPersonaData = data => _.defaults(data, {
    name: 'Persona',
    organisation: this.orgId,
    identifiers: [],
    personStatements: [],
    personStudents: []
  });
  createPersona = (data = this.getPersonaData(), done) => Persona.create(data, done)
  cleanupPersonas = done => this.cleanModels([Persona], done)

  getStatementData = (data = {}, statementData = {}) => {
    const statement = _.defaultsDeep(statementData, {
      id: '5e56d6e9-e585-43c4-9bc4-52ba40c7ab4f',
      version: '1.0.1',
      actor: {
        objectType: 'Agent',
        mbox: this.mboxIdent.value,
        name: this.nameIdent.value
      },
      verb: {
        id: 'http://www.example.com'
      },
      object: {
        objectType: 'Activity',
        id: 'http://www.example.com'
      },
      authority: {
        objectType: 'Agent',
        mbox: 'mailto:hello@learninglocker.net',
        name: 'New Client'
      },
      stored: '2016-04-13T12:34:58.392000+00:00',
      timestamp: '2016-04-13T12:34:58.392000+00:00',
    });

    return _.defaultsDeep(data, {
      client_id: this.clientId,
      lrs_id: this.lrsId,
      organisation: this.orgId,
      statement,
      active: true,
      voided: false,
      timestamp: '2016-04-15T11:21:27.000Z',
      updated_at: '2016-04-15T11:21:27.705Z'
    });
  };
  createStatement = (data = this.getStatementData(), done) => Statement.create(data, done)
  cleanupStatements = done => this.cleanModels([Statement], done)

  prepare = (done) => {
    const mboxStatementData = this.getStatementData({
      statement: {
        actor: {
          mbox: this.mboxIdent.value,
          name: this.nameIdent.value
        }
      }
    });
    const openidStatementData = this.getStatementData({
      statement: {
        actor: {
          openid: this.openIdent.value,
          name: this.nameIdent.value
        }
      }
    });
    const accountStatementData = this.getStatementData({
      statement: {
        actor: {
          account: this.accountIdent.value,
          name: this.nameIdent.value
        }
      }
    });
    const sha1StatementData = this.getStatementData({
      statement: {
        actor: {
          mbox_sha1sum: this.sha1Ident.value,
          name: this.nameIdent.value
        }
      }
    });
    delete (openidStatementData.statement.actor.mbox);
    delete (accountStatementData.statement.actor.mbox);
    delete (sha1StatementData.statement.actor.mbox);

    async.parallel({
      organisation: insertDone => Organisation.create({ _id: this.orgId, name: 'Test org' }, insertDone),
      scoringScheme: insertDone => ScoringScheme.create({ organisation: this.orgId }, insertDone),
      persona: insertDone => this.createPersona(this.getPersonaData(), insertDone),
      persona2: insertDone => this.createPersona(this.getPersonaData(), insertDone),
      persona3: insertDone => this.createPersona(this.getPersonaData(), insertDone),

      mboxStatement: insertDone => this.createStatement(mboxStatementData, insertDone),
      accountStatement: insertDone => this.createStatement(accountStatementData, insertDone),
      openIdStatement: insertDone => this.createStatement(openidStatementData, insertDone),
      mboxSha1SumStatement: insertDone => this.createStatement(sha1StatementData, insertDone),

      lrs: insertDone => Lrs.create({
        _id: '5703860ba1b798b45bc73683',
        organisation: '56fbb868f1ec870140f0f9f8',
        statementCount: 2,
        description: 'A Test',
        title: 'Tester'
      }, insertDone)
    }, (err, results) => {
      this.organisation = results.organisation;
      // this.scoringScheme = results.scoringScheme;

      this.persona = results.persona;
      this.persona2 = results.persona2;
      this.persona3 = results.persona3;

      this.statements = {
        mbox: results.mboxStatement,
        account: results.accountStatement,
        openid: results.openIdStatement,
        mbox_sha1sum: results.mboxSha1SumStatement,
      };

      this.lrs = results.lrs;
      done(err);
    });
  }

  cleanUp = (done) => {
    this.cleanModels([Organisation, ScoringScheme, Persona, PersonaIdentifier, Statement, Lrs], done);
  }
}
