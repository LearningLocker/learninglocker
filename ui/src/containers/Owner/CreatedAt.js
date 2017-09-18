import moment from 'moment';

export default createdAt =>
  `Created ${moment(createdAt).fromNow()} - ${moment(createdAt).format('YYYY-MM-DD HH:mm:ss')}`;
