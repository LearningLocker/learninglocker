import Statement from 'lib/models/statement';
import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';
import testId from 'api/routes/tests/utils/testId';
import { expect } from 'chai';
import values from 'lodash/values';
import getPersonaService from 'lib/connections/personaService';
import awaitReadyConnection from 'api/routes/tests/utils/awaitReadyConnection';
import reasignPersonaStatements from '../reasignPersonaStatements';

const objectId = mongoose.Types.ObjectId;

describe('reasignPersonaStatements', () => {
  const organisation = testId;
  const personaService = getPersonaService();
  const connection = getConnection();

  beforeEach('Set up people and statements for testing', async () => {
    await awaitReadyConnection(connection);
    await personaService.clearService();
    await Statement.deleteMany({});
  });

  afterEach('Clear db collections', async () => {
    await personaService.clearService();
    await Promise.all(values(connection.models).map(model => model.deleteMany({})));
  });

  after(async () => {
    await Statement.deleteMany({});
  });

  it('should reasign persona statements', async () => {
    const personId = objectId();

    const result = await connection.collection('statements').insertOne({
      organisation: objectId(organisation),
      person: {
        _id: personId
      }
    });

    const statementId = result.insertedId;

    const { persona } = await personaService.createPersona({
      organisation,
      name: 'Dave'
    });

    await reasignPersonaStatements({
      organisation,
      fromId: personId.toString(),
      toId: persona.id
    });

    const finishedStatement = await Statement.findOne({
      _id: objectId(statementId)
    });

    expect(finishedStatement.person._id.toString()).to.equal(persona.id);
    expect(finishedStatement.person.display).to.equal('Dave');
  });
});
