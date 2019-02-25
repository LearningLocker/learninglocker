import moment from 'moment';

/**
 * Format created datetime
 *
 * @param {*} createdAt
 * @returns {string}
 */
export default (createdAt) => {
  if (!createdAt) return '';
  return `Created ${moment(createdAt).fromNow()} - ${moment(createdAt).format('YYYY-MM-DD HH:mm:ss')}`;
};
