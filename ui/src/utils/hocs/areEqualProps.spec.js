import { fromJS } from 'immutable';
import areEqualProps from './areEqualProps';

describe('areEqualProps', () => {
  test('should return true when all values are equal', () => {
    const o1 = {
      a: 2,
      c: fromJS({ c1: 1, c2: [2, 3] })
    };
    const o2 = {
      a: 2,
      c: fromJS({ c1: 1, c2: [2, 3] })
    };
    expect(areEqualProps(o1, o2)).toEqual(true);
  });

  test('should return true when both args are empty', () => {
    expect(areEqualProps({}, {})).toEqual(true);
  });

  test('should ignore function', () => {
    const o1 = {
      f: () => 1,
    };
    const o2 = {
      f: () => 2,
      g: () => 3,
    };
    expect(areEqualProps(o1, o2)).toEqual(true);
  });

  test('should return false when o2 has a key but o1 does not', () => {
    const o1 = {};
    const o2 = { a: 2 };
    expect(areEqualProps(o1, o2)).toEqual(false);
  });

  test('should return false when o1 is a immutable.Collection but o2 is not the same', () => {
    const o1 = { a: fromJS([1, 2]) };
    const o2 = { a: fromJS([1, 2, 3]) };
    expect(areEqualProps(o1, o2)).toEqual(false);
  });

  test('should return true when o1 is not an array but o1 and o2 are deeply equal', () => {
    const o1 = { a: [1, 2] };
    const o2 = { a: [1, 2] };
    expect(areEqualProps(o1, o2)).toEqual(true);
  });

  test('should return true when o1 is not an object but o1 and o2 are deeply equal', () => {
    const o1 = { a: { x: 1 } };
    const o2 = { a: { x: 1 } };
    expect(areEqualProps(o1, o2)).toEqual(true);
  });
});
