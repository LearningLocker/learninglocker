/* eslint-disable no-unused-expressions */
/* eslint-disable no-unused-vars */
import { expect } from 'chai';
import * as models from 'lib/models';
import { getConnection } from 'lib/connections/mongoose';
import { getAtPath } from 'lib/services/querybuildercache/getCachesFromStatement';
import QueryBuilderCacheDBHelper from 'worker/handlers/statement/tests/queryBuilderCacheDBHelper';

const queryBuilderCacheDBHelper = new QueryBuilderCacheDBHelper();

describe('Query builder cache handler test', () => {
  before((done) => {
    const connection = getConnection();
    if (connection.readyState !== 1) {
      connection.on('connected', done);
    } else {
      done();
    }
  });

  beforeEach('Set up caches and statements for testing', (done) => {
    queryBuilderCacheDBHelper.prepare(done);
  });

  afterEach('Clear db collections', (done) => {
    queryBuilderCacheDBHelper.cleanUp(done);
  });

  describe('getAtPath', () => {
    it('should get an actor', (done) => {
      const statement = queryBuilderCacheDBHelper.personStatement;
      const searchPath = ['statement', 'actor'];
      const value = getAtPath(statement, { searchPath });
      expect(value).to.deep.equal({
        display: null,
        fullValue: statement.statement.actor,
        path: searchPath,
        value: statement.statement.actor
      });
      done();
    });
    it('should get an object from a path', (done) => {
      const statement = queryBuilderCacheDBHelper.personStatement;
      const searchPath = ['statement', 'object'];
      const value = getAtPath(statement, { searchPath });
      expect(value.path).to.deep.equal(searchPath);
      expect(value.value.id).to.deep.equal(statement.statement.object.id);
      done();
    });
    it('should get wildcard values', (done) => {
      const statement = {
        id: '561a679c0c5d017e4004714f',
        actor: { mbox: 'mailto:test@example.org' },
        verb: { id: 'http://example.org/verb' },
        object: { id: 'http://example.org/object' },
      };
      const searchPath = ['statement', '*'];
      const value = getAtPath({ statement }, { searchPath });
      expect(value).to.deep.equal([
        { display: null, fullValue: statement.id, path: ['statement', 'id'], value: statement.id },
        { display: null, fullValue: statement.actor.mbox, path: ['statement', 'actor', 'mbox'], value: statement.actor.mbox },
        { display: null, fullValue: statement.verb.id, path: ['statement', 'verb', 'id'], value: statement.verb.id },
        { display: null, fullValue: statement.object.id, path: ['statement', 'object', 'id'], value: statement.object.id },
      ]);
      done();
    });
    it('should filter wildcard values', (done) => {
      const extensionKey = 'http://example.org/extension';
      const statement = {
        id: '561a679c0c5d017e4004714f',
        actor: { mbox: 'mailto:test@example.org' },
        verb: { id: 'http://example.org/verb' },
        object: { id: 'http://example.org/object' },
        context: {
          extensions: {
            [extensionKey]: {
              test: 'testCategory'
            }
          }
        }
      };
      const searchPath = ['statement', 'context', 'extensions', '*'];
      const filter = ['id'];
      const value = getAtPath({ statement }, { searchPath, filter });
      expect(value).to.deep.equal([{
        display: null,
        fullValue: 'testCategory',
        path: ['statement', 'context', 'extensions', extensionKey, 'test'],
        value: 'testCategory'
      }]);
      done();
    });
  });
});
