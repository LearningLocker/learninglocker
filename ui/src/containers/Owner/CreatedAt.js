import moment from 'moment';

export default (createdAt) => {
  if (!createdAt) return '';
  return `Created ${moment(createdAt).fromNow()}`;
};
