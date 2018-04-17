import React from 'react';
import getDateFromMongoID from 'lib/helpers/getDateFromMongoID';
import { withProps, compose } from 'recompose';
import { withModel } from 'ui/utils/hocs';
import createdAtFormatter from './CreatedAt';

const getCreatedDate = (createdAt, _id) => {
  if (!createdAt && _id) {
    try {
      return getDateFromMongoID(_id);
    } catch (err) {
      // error getting date from id (might not be a valid mongo id)
      return;
    }
  }
  return createdAt;
};

const Creator = compose(
  withProps(({ model }) => ({ schema: 'user', id: model.get('owner') })),
  withModel
)(({ model, date }) => {
  const email = model.get('email', false);
  const name = model.get('name', false);
  return (
    <div>
      <div style={{ fontWeight: 'bold' }}>Made by { email ? <i>{name || email}</i> : <i>deleted user</i> }</div>
      <div>{ date }</div>
    </div>
  );
});

export default ({ model }) => {
  const date = getCreatedDate(model.get('createdAt', false), model.get('_id'));
  const formattedDate = createdAtFormatter(date);
  return (
    model.has('owner')
    ? <Creator model={model} date={formattedDate} />
    : <div style={{ marginTop: 8 }}>{ formattedDate }</div>
  );
};
