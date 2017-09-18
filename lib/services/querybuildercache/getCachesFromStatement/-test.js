/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import getCachesFromStatement from '.';
import { prepare, cleanUp, data } from './fixtures';

describe('getCachesFromStatement', () => {
  before('clear the DB', cleanUp);

  beforeEach('Set up statements for testing', prepare);
  afterEach('Clear db collections', cleanUp);

  it('should correctly take a statement and produce a flattened map of paths and values', () => {
    const { statement1, result1 } = data;
    const result = getCachesFromStatement(statement1);
    expect(result).to.deep.equal(result1);
  });
});
