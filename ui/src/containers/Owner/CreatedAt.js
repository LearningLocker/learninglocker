import moment from 'moment';

export default (createdAt, prefix = 'Created') => {
  if (!createdAt) return '';
  return `${prefix} ${moment(createdAt).fromNow()} - ${moment(createdAt).format('YYYY-MM-DD HH:mm:ss')}`;
};
