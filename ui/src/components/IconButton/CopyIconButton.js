import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import ConfirmModal from 'ui/components/Modal/ConfirmModal';

/**
 * @param {string} _.message
 * @param {boolean} _.white - white button? default is btn-inverse
 * @param {() => void} _.onClickConfirm
 */
const CopyIconButton = ({ message, white, onClickConfirm, textFormat }) => {
  const [isModalOpen, setModalOpen] = useState(false);

  const closeModal = useCallback(() => setModalOpen(false));
  const openModal = useCallback((e) => {
    e.stopPropagation();
    setModalOpen(true);
  });
  const onConfirm = useCallback(() => {
    onClickConfirm();
    setModalOpen(false);
  });
  const renderConfirmModal = (
    <ConfirmModal
      isOpen={isModalOpen}
      title="Confirm copy"
      message={<span>{message}</span>}
      onConfirm={onConfirm}
      onCancel={closeModal} />
  );

  const className = white === true ?
    'btn btn-default btn-sm flat-btn flat-white' :
    'btn btn-sm btn-inverse';

  return (
    textFormat ? (
      <span
        onClick={openModal}>
        Duplicate
        {renderConfirmModal}
      </span>
    ) : (
      <button
        className={className}
        title="Copy"
        onClick={openModal}
        style={{ width: '33px' }}>
        <i className="icon ion-ios-copy" />
        {renderConfirmModal}
      </button>
    )
  );
};

CopyIconButton.propTypes = {
  message: PropTypes.string.isRequired,
  white: PropTypes.bool,
  onClickConfirm: PropTypes.func.isRequired,
};

export default CopyIconButton;
