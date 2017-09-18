/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { List, Map } from 'immutable';
import { resultCaches, match } from 'ui/redux/modules/tests/queryBuilderFixtures';
import {
  matchArrays,
  buildChildrenFromCaches,
  getIdentifiersFromMatch
} from 'ui/redux/modules/queryBuilder';

describe('Query builder tests', () => {
  describe('matchArrays', () => {
    it('should match two identical arrays', () => {
      const needle = new List(['statement', 'object']);
      const hay = new List(['statement', 'object']);
      const hasMatch = matchArrays(needle, hay);
      expect(hasMatch).to.be.true;
    });

    it('should match a haystack containing a wildcard at the same depth', () => {
      const needle = new List(['statement', 'object', 'id']);
      const hay = new List(['statement', 'object', '*']);
      const hasMatch = matchArrays(needle, hay);
      expect(hasMatch).to.be.true;
    });

    it('should match a haystack containing a wildcard at greater depth', () => {
      const needle = new List(['statement', 'object', 'id']);
      const hay = new List(['statement', '*']);
      const hasMatch = matchArrays(needle, hay);
      expect(hasMatch).to.be.true;
    });

    it('should not match a haystack containing a wildcard at less depth', () => {
      const needle = new List(['statement', 'object']);
      const hay = new List(['statement', 'object', '*']);
      const hasMatch = matchArrays(needle, hay);
      expect(hasMatch).to.be.false;
    });

    it('should not match a haystack containing a wildcard with different stems', () => {
      const needle = new List(['statement', 'object', 'id']);
      const hay = new List(['statement', 'verb', '*']);
      const hasMatch = matchArrays(needle, hay);
      expect(hasMatch).to.be.false;
    });
  });

  describe('buildChildrenFromCaches', () => {
    it('should return an array of children', () => {
      const children = buildChildrenFromCaches(3, resultCaches, new Map());
      expect(children).to.not.be.null; //eslint-disable-line
    });
  });

  describe('getIdentifiers from match', () => {
    it('should return an array of actors', () => {
      const idents = getIdentifiersFromMatch(match, new List(['statement', 'actor']));
      expect(idents).to.not.be.null; //eslint-disable-line
    });

    it('should return an array of revisions', () => {
      const idents = getIdentifiersFromMatch(match, new List(['statement', 'context', 'revision']));
      expect(idents.toJS()).to.deep.equal([
        {
          'statement.context.revision': '5.0.7'
        }
      ]);
    });

    it('should return an array of people', () => {
      const idents = getIdentifiersFromMatch(match, new List(['person']));
      expect(idents.toJS()).to.deep.equal([{
        'person._id': {
          $oid: '57555632ecf823f7307f50e6'
        }
      }]);
    });
  });
});
