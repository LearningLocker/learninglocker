import moment from 'moment';

export default (createdAt, {
  future = 'Created',
  past = 'Created'
}) => {
  if (!createdAt) return '';
  let prefix = future;
  if (moment(createdAt).isBefore(moment())) {
    prefix = past;
  }
  return `${prefix} ${moment(createdAt).fromNow()} - ${moment(createdAt).format('YYYY-MM-DD HH:mm:ss')}`;
};
