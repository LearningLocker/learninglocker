import moment from 'moment';
import React from 'react';

export default (createdAt) => {
  if (!createdAt) return '';
  return (<span>{'Created '}
    <span title={moment(createdAt).format('YYYY-MM-DD HH:mm:ss')}>{moment(createdAt).fromNow()}</span>
  </span>);
};
