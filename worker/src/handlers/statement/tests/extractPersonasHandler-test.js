import mongoose from 'mongoose';
import { expect } from 'chai';
import async from 'async';
import Promise, { promisify } from 'bluebird';
import Statement from 'lib/models/statement';
import getPersonaService from 'lib/connections/personaService';
import {
  STATEMENT_JOURNEY_QUEUE,
  STATEMENT_QUERYBUILDERCACHE_QUEUE,
  STATEMENT_EXTRACT_PERSONAS_QUEUE,
  STATEMENT_FORWARDING_QUEUE
} from 'lib/constants/statements';
import extractPersonasHandler, {
  extractPersonasStatementHandler
} from '../extractPersonasHandler';

const objectId = mongoose.Types.ObjectId;

const cleanUp = () => new Promise(reslove =>
  async.forEach(
    [Statement],
    (model, doneDeleting) => {
      model.deleteMany({}, doneDeleting);
    },
    reslove
  )
);

describe('Extract persona handler', () => {
  const personaService = getPersonaService();

  const statementId = '561a679c0c5d017e4004714f';
  const organisationId = '561a679c0c5d017e4004715a';

  const testStatement = {
    active: true,
    _id: statementId,
    lrs_id: '560a679c0c5d017e4004714f',
    organisation: organisationId,
    statement: {
      test: 'test',
      actor: {
        name: 'Juan Morales',
        mbox: 'mailto:juanmorales@acorncorp.com',
        objectType: 'Agent',
      }
    },
    processingQueues: [
      STATEMENT_EXTRACT_PERSONAS_QUEUE
    ],
    completedQueues: [
      STATEMENT_QUERYBUILDERCACHE_QUEUE,
      STATEMENT_JOURNEY_QUEUE,
      STATEMENT_FORWARDING_QUEUE,
    ]
  };

  beforeEach(async () => {
    await cleanUp();
  });

  beforeEach(async () => {
    await personaService.clearService();
  });

  afterEach(() => {
    personaService.clearService();
  });

  it('Should extract a persona if no presona or identifier exists', async () => {
    await Statement.create(testStatement);

    await Promise.promisify(
      extractPersonasHandler(personaService)
    )({ statementId });

    const { personaId, identifierId } = await personaService.getIdentifierByIfi({
      organisation: organisationId,
      ifi: {
        key: 'mbox',
        value: 'mailto:juanmorales@acorncorp.com',
      }
    });

    const { persona } = await personaService.getPersona({
      organisation: organisationId,
      personaId
    });

    expect(persona.name).to.equal('Juan Morales');

    const statement = await Statement.findById(objectId(statementId));

    expect(statement.person._id.toString()).to.equal(personaId);
    expect(statement.person.display).to.equal('Juan Morales');
    expect(statement.personaIdentifier.toString()).to.equal(identifierId);
  }).timeout(5000);

  it('Should extract a persona if statements are in an array', async () => {
    await Statement.create(testStatement);

    await Promise.promisify(
      extractPersonasHandler(personaService)
    )({ statementId });

    const { personaId, identifierId } = await personaService.getIdentifierByIfi({
      organisation: organisationId,
      ifi: {
        key: 'mbox',
        value: 'mailto:juanmorales@acorncorp.com',
      }
    });

    const { persona } = await personaService.getPersona({
      organisation: organisationId,
      personaId
    });

    expect(persona.name).to.equal('Juan Morales');

    const statement = await Statement.findById(objectId(statementId));

    expect(statement.person._id.toString()).to.equal(personaId);
    expect(statement.personaIdentifier.toString()).to.equal(identifierId);
  });

  it(
    'Should add a persona to an identifier if the identifier and persona exists',
  async () => {
    await Statement.create(testStatement);

    // Add the persona

    const { persona: createdPersona } = await personaService.createPersona({
      name: 'Lucky',
      organisation: organisationId
    });
    await personaService.createIdentifier({
      ifi: {
        key: 'mbox',
        value: 'mailto:juanmorales@acorncorp.com'
      },
      persona: createdPersona.id,
      organisation: organisationId
    });

    // Add the identifier

    const statement = await Statement.findById(statementId);

    await promisify(extractPersonasStatementHandler(personaService))([statement]);

    const { personaId, identifierId } = await personaService.getIdentifierByIfi({
      organisation: organisationId,
      ifi: {
        key: 'mbox',
        value: 'mailto:juanmorales@acorncorp.com',
      }
    });

    const { persona } = await personaService.getPersona({
      organisation: organisationId,
      personaId
    });

    expect(persona.name).to.equal('Lucky');

    const statement2 = await Statement.findById(objectId(statementId));

    expect(statement2.person._id.toString()).to.equal(personaId);
    expect(statement2.personaIdentifier.toString()).to.equal(identifierId);
  }).timeout(5000);

  it('should update matching statements with new persona id and identifier id', async () => {
    await Statement.create(testStatement);

    const queueStatementId = '561a679c0c5d017e40047151';

    const queueStatement = {
      ...testStatement,
      _id: queueStatementId
    };
    await Statement.create(queueStatement);

    // RUN
    await Promise.promisify(
      extractPersonasHandler(personaService)
    )({ statementId: queueStatementId });

    // TEST
    const statement1 = await Statement.findById(objectId(statementId));
    const statement2 = await Statement.findById(objectId(queueStatementId));

    expect(statement1.person._id.toString()).to.equal(
      statement2.person._id.toString()
    );
    expect(statement1.personaIdentifier.toString()).to.equal(
      statement2.personaIdentifier.toString()
    );
    expect(statement1.person.display).to.equal(
      statement2.person.display
    );
  }).timeout(5000);
});
