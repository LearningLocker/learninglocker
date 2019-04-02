import moment from 'moment-timezone';

export const BLACKLIST = [
  'Etc/GMT+0',
  'Etc/GMT-0',
  'Etc/GMT0',
  'GMT+0',
  'GMT-0',
  'GMT0',
  'UCT',
];

/**
 * list of filtered timezone names
 *
 * @type {string[]}
 */
export const timezones = moment.tz.names().filter(n => !BLACKLIST.includes(n));
