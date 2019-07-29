import React, { useState, useCallback } from 'react';
import { connect } from 'react-redux';
import { compose, withHandlers, mapProps } from 'recompose';
import { withModel } from 'ui/utils/hocs';
import ConfirmModal from 'ui/components/Modal/ConfirmModal';
import { loggedInUserId } from 'ui/redux/modules/auth';
import { COPY_VISUALISATION } from 'ui/redux/modules/visualisation/copyVisualisation';

/**
 * @param {function} _.copyVisualisation
 */
const CopyIconButton = ({ copyVisualisation }) => {
  const [isModalOpen, setModalOpen] = useState(false);

  const closeModal = useCallback(() => setModalOpen(false));
  const openModal = useCallback((e) => {
    e.stopPropagation();
    setModalOpen(true);
  });
  const onClickConfirm = useCallback(() => {
    copyVisualisation();
    setModalOpen(false);
  });

  return (
    <button
      className="btn btn-sm btn-inverse"
      title="Copy"
      onClick={openModal}
      style={{ width: '33px' }}>
      <i className="icon ion-ios-copy" />

      <ConfirmModal
        isOpen={isModalOpen}
        title="Confirm copy"
        message={<span>This will copy the visualisation. Are you sure?</span>}
        onConfirm={onClickConfirm}
        onCancel={closeModal} />
    </button>
  );
};

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
  mapProps(({ copyVisualisation }) => ({ copyVisualisation })),
)(CopyIconButton);

export default CopyButton;
