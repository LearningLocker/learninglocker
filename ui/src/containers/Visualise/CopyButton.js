import React from 'react';
import { connect } from 'react-redux';
import { compose, withHandlers } from 'recompose';
import { withModel } from 'ui/utils/hocs';
import { loggedInUserId } from 'ui/redux/modules/auth';
import { COPY_VISUALISATION } from 'ui/redux/modules/visualisation/copyVisualisation';

/**
 * @param {function} _.onClick
 */
const CopyIconButton = ({ onClick }) => (
  <button
    className="btn btn-sm btn-inverse"
    title="Copy"
    onClick={onClick}
    style={{ width: '33px' }}>
    <i className="icon ion-ios-copy" />
  </button>
);

/**
 * @param {string} _.schema
 * @param {string} _.id
 */
const CopyButton = compose(
  withModel,
  connect(
    state => ({
      userId: loggedInUserId(state),
    }),
    dispatch => ({
      copyVisualisation: ({ visualisation, userId }) => dispatch({
        type: COPY_VISUALISATION,
        visualisation,
        userId,
        dispatch,
      }),
    }),
  ),
  withHandlers({
    onClick: ({ model, userId, copyVisualisation }) => () => {
      console.log(userId);
      copyVisualisation({
        visualisation: model,
        userId,
      });
    }
  })
)(CopyIconButton);

export default CopyButton;
