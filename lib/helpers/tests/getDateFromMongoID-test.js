import { expect } from 'chai';
import getDateFromMongoID from '../getDateFromMongoID';

const _id = '5c2aad800000000000000000';
describe('getDateFromMongoID', () => {
  it('should return date for Mongo ID as string', () => {
    const date = getDateFromMongoID(_id);
    const expectedDate = new Date(Date.UTC(2019, 0, 1, 0, 0, 0));
    expect(date.getTime()).to.equal(expectedDate.getTime());
  });

  it('should error when _id is not a string', () => {
    expect(getDateFromMongoID.bind(null, 123)).to.throw(Error);
    expect(getDateFromMongoID.bind(null, false)).to.throw(Error);
    expect(getDateFromMongoID.bind(null, undefined)).to.throw(Error);
    expect(getDateFromMongoID.bind(null, null)).to.throw(Error);
    expect(getDateFromMongoID.bind(null, {})).to.throw(Error);
    expect(getDateFromMongoID.bind(null, [])).to.throw(Error);
  });

  it('should error when _id is not 24 chars', () => {
    expect(getDateFromMongoID.bind(null, 'abc')).to.throw(Error);
    expect(getDateFromMongoID.bind(null, `${_id}0`)).to.throw(Error);
  });

  it('should error when _id does not contain a valid hex date', () => {
    expect(getDateFromMongoID.bind(null, 'Zad52af00000000000000000')).to.throw(Error);
  });
});
