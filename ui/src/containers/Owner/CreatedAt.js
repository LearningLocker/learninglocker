import moment from 'moment';

export default createdAt => {
  if (!createdAt) return '';
  return `Created ${moment(createdAt).fromNow()} - ${moment(createdAt).format('YYYY-MM-DD HH:mm:ss')}`;
}
