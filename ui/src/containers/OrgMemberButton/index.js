import React from 'react';
import { List } from 'immutable';
import { connect } from 'react-redux';
import { compose, withHandlers, withProps } from 'recompose';
import { withModel } from 'ui/utils/hocs';
import { loggedInUserSelector } from 'ui/redux/modules/auth';
import { updateModel as updateModelAction } from 'ui/redux/modules/models';

const enhance = compose(
  withModel,
  connect(
    state => ({
      authUser: loggedInUserSelector(state)
    }),
    { updateModel: updateModelAction }
  ),
  withProps(({ authUser }) => ({
    userOrgs: authUser.get('organisations', new List())
  })),
  withHandlers({
    handleJoin: ({ updateModel, userOrgs, model, authUser }) => (e) => {
      updateModel({
        schema: 'user',
        id: authUser.get('_id'),
        path: ['organisations'],
        value: userOrgs.push(model.get('_id'))
      });
      e.stopPropagation();
    },
    handleLeave: ({ updateModel, userOrgs, model, authUser }) => (e) => {
      updateModel({
        schema: 'user',
        id: authUser.get('_id'),
        path: ['organisations'],
        value: userOrgs.remove(
          userOrgs.findIndex(userOrg => model.get('_id') === userOrg)
        )
      });
      e.stopPropagation();
    }
  })
);

const render = ({ handleJoin, handleLeave, model, userOrgs }) => {
  const hasOrg = userOrgs.includes(model.get('_id'));
  return hasOrg
    ? <button
      title="Leave organisation"
      className="btn-sm btn btn-inverse"
      onClick={handleLeave}
      style={{ width: '33px' }}>
      <i className="ion ion-ios-upload-outline" />
    </button>
    : <button
      title="Join organisation"
      className="btn-sm btn btn-inverse"
      onClick={handleJoin}
      style={{ width: '33px' }}>
      <i className="ion ion-ios-download-outline" />
    </button>;
};

export default enhance(render);
