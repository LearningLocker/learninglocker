import { getConnection } from 'lib/connections/mongoose';
import { ObjectId } from 'mongodb';
import testId from 'api/routes/tests/utils/testId';
import { expect } from 'chai';
import getPersonaService from 'lib/connections/personaService';
import awaitReadyConnection from 'api/routes/tests/utils/awaitReadyConnection';
import identifierHasStatements from '../identifierHasStatements';


describe('asignIdentifierStatements', () => {
  const organisation = testId;
  const connection = getConnection();
  const personaService = getPersonaService();

  beforeEach('Set up people and statements for testing', async () => {
    await awaitReadyConnection(connection);
    await personaService.clearService();
  });

  afterEach('Clear db collections', async () => {
    await personaService.clearService();
  });

  it('should return true when identifier matches a statement', async () => {
    const ifi = {
      key: 'mbox',
      value: 'test@ifi.com',
    };
    const { identifier } = await personaService.createUpdateIdentifierPersona({
      organisation: testId,
      personaName: 'Test person',
      ifi,
    });

    await connection.collection('statements').insert({
      organisation: new ObjectId(organisation),
      statement: {
        actor: { mbox: ifi.value }
      }
    });

    const hasStatement = await identifierHasStatements({
      organisation: testId,
      identifierId: identifier.id,
    });


    expect(hasStatement).to.equal(true);
  });

  it('should return false when identifier does not match a statement in the organisation', async () => {
    const otherOrg = new ObjectId();
    const ifi = {
      key: 'account',
      value: { homePage: 'http://test.com', name: 'testifi' },
    };
    const { identifier } = await personaService.createUpdateIdentifierPersona({
      organisation: testId,
      personaName: 'Test person',
      ifi,
    });

    await personaService.createUpdateIdentifierPersona({
      organisation: otherOrg,
      personaName: 'Test person',
      ifi,
    });

    await connection.collection('statements').insert({
      organisation: otherOrg,
      statement: {
        actor: { mbox: ifi.value }
      }
    });

    const hasStatement = await identifierHasStatements({
      organisation: testId,
      identifierId: identifier.id,
    });

    expect(hasStatement).to.equal(false);
  });
});
