import { connect } from 'react-redux';
import { compose, withHandlers, mapProps } from 'recompose';
import { withModel } from 'ui/utils/hocs';
import CopyIconButton from 'ui/components/IconButton/CopyIconButton';
import { loggedInUserId } from 'ui/redux/modules/auth';
import { COPY_VISUALISATION } from 'ui/redux/modules/visualisation/copyVisualisation';

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
      doCopyVisualisation: ({ visualisation, userId }) => dispatch({
        type: COPY_VISUALISATION,
        visualisation,
        userId,
        dispatch,
      }),
    }),
  ),
  withHandlers({
    copyVisualisation: ({ model, userId, doCopyVisualisation }) => () => {
      doCopyVisualisation({
        visualisation: model,
        userId,
      });
    }
  }),
  mapProps(
    ({ copyVisualisation }) => ({
      message: 'This will copy the visualisation. Are you sure?',
      onClickConfirm: copyVisualisation,
    }),
  ),
)(CopyIconButton);

export default CopyButton;
