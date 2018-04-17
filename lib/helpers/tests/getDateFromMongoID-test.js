import { expect } from 'chai';
import getDateFromMongoID from '../getDateFromMongoID';

const _id = '5ad52af00000000000000000';
describe.only('getDateFromMongoID', () => {
  it('should return date for Mongo ID as string', () => {
    const date = getDateFromMongoID(_id);
    const expectedDate = new Date("2018-04-16T23:00:00");
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

});
