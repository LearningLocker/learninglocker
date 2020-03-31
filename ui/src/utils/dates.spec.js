import moment from 'moment-timezone';
import {
  LAST_24_HOURS,
  TODAY
} from 'ui/utils/constants';
import { periodToDate } from './dates';

describe('dates', () => {
  test('periodToDate returns local today\'s midnight in UTC when period is TODAY (1)', () => {
    // 2019-02-27 01:06:00 in Asia/Tokyo
    const currentMoment = moment('2019-02-26 16:06:00').utc();
    const expected = moment('2019-02-26 15:00:00').utc();
    const actual = periodToDate(TODAY, 'Asia/Tokyo', currentMoment);
    expect(actual.toISOString()).toEqual(expected.toISOString());
  });

  test('periodToDate returns local today\'s midnight in UTC when period is TODAY (2)', () => {
    // 2019-02-26 23:59:00 in Asia/Tokyo
    const currentMoment = moment('2019-02-26 14:59:00').utc();
    const expected = moment('2019-02-25 15:00:00').utc();
    const actual = periodToDate(TODAY, 'Asia/Tokyo', currentMoment);
    expect(actual.toISOString()).toEqual(expected.toISOString());
  });

  test('periodToDate returns 24 hours ago in UTC when period id LAST_24_HOURS', () => {
    const currentMoment = moment('2019-02-26 16:06:00').utc();
    const expected = moment('2019-02-25 16:06:00').utc();
    const actual = periodToDate(LAST_24_HOURS, 'Asia/Tokyo', currentMoment);
    expect(actual.toISOString()).toEqual(expected.toISOString());
  });
});
