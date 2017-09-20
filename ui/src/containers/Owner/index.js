import React from 'react';
import { withProps, compose } from 'recompose';
import { withModel } from 'ui/utils/hocs';
import createdAtFormatter from './CreatedAt';

const Creator = compose(
  withProps(({ model }) => ({ schema: 'user', id: model.get('owner') })),
  withModel
)(({ model, createdAt }) => {
  const email = model.get('email', false);
  const name = model.get('name', false);
  return (
    <div>
      <div style={{ fontWeight: 'bold' }}>Made by { email ? <i>{name || email}</i> : <i>deleted user</i> }</div>
      <div>{ createdAtFormatter(createdAt) }</div>
    </div>
  );
});

export default ({ model }) => (
  model.has('owner')
  ? <Creator model={model} createdAt={model.get('createdAt', false)} />
  : <div style={{ marginTop: 8 }}>{ createdAtFormatter(model.get('createdAt')) }</div>
);
