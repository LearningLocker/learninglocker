import Statement from 'lib/models/statement';
import mongoose from 'mongoose';
import { expect } from 'chai';
import async from 'async';
import Promise, { promisify } from 'bluebird';
import {
  STATEMENT_JOURNEY_QUEUE,
  STATEMENT_QUERYBUILDERCACHE_QUEUE,
  STATEMENT_EXTRACT_PERSONAS_QUEUE,
  STATEMENT_FORWARDING_QUEUE
} from 'lib/constants/statements';
import extractPersonasHandler, {
  extractPersonasStatementHandler
} from '../extractPersonasHandler';
import { getPersonaService } from '../index';

const objectId = mongoose.Types.ObjectId;

const cleanUp = () => new Promise(reslove =>
  async.forEach(
    [Statement],
    (model, doneDeleting) => {
      model.remove({}, doneDeleting);
    },
    reslove
  )
);

describe('Extract persona handler', () => {
  let personaFacade;

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
    personaFacade = getPersonaService();
    await personaFacade.clearService();
  });

  afterEach(() => {
    personaFacade.clearService();
  });

  it('Should extract a persona if no presona or identifer exists', async () => {
    await Statement.create(testStatement);

    await Promise.promisify(
      extractPersonasHandler(personaFacade)
    )({ statementId });

    const { personaId, identifierId } = await personaFacade.getIdentifierByIfi({
      organisation: organisationId,
      ifi: {
        key: 'mbox',
        value: 'mailto:juanmorales@acorncorp.com',
      }
    });

    const { persona } = await personaFacade.getPersona({
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

    console.log('101', statementId);
    await Promise.promisify(
      extractPersonasHandler(personaFacade)
    )({ statementId });

    const { personaId, identifierId } = await personaFacade.getIdentifierByIfi({
      organisation: organisationId,
      ifi: {
        key: 'mbox',
        value: 'mailto:juanmorales@acorncorp.com',
      }
    });

    const { persona } = await personaFacade.getPersona({
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

    const { persona: createdPersona } = await personaFacade.createPersona({
      name: 'Lucky',
      organisation: organisationId
    });
    await personaFacade.createIdentifier({
      ifi: {
        key: 'mbox',
        value: 'mailto:juanmorales@acorncorp.com'
      },
      persona: createdPersona.id,
      organisation: organisationId
    });

    // Add the identifier

    const statement = await Statement.findById(statementId);

    await promisify(extractPersonasStatementHandler(personaFacade))([statement]);

    const { personaId, identifierId } = await personaFacade.getIdentifierByIfi({
      organisation: organisationId,
      ifi: {
        key: 'mbox',
        value: 'mailto:juanmorales@acorncorp.com',
      }
    });

    const { persona } = await personaFacade.getPersona({
      organisation: organisationId,
      personaId
    });

    expect(persona.name).to.equal('Lucky');

    const statement2 = await Statement.findById(objectId(statementId));

    expect(statement2.person._id.toString()).to.equal(personaId);
    expect(statement2.personaIdentifier.toString()).to.equal(identifierId);
  }).timeout(5000);
});
