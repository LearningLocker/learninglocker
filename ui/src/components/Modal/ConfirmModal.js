import React, { Component, PropTypes } from 'react';
import Portal from 'react-portal';
import { connect } from 'react-redux';
import { compose, setPropTypes, defaultProps } from 'recompose';
import { lowerCase } from 'lodash';
import { deleteModel } from 'ui/redux/modules/models';
import TextIconButton from 'ui/components/TextIconButton/TextIconButton';
import Modal from 'ui/components/Modal/Modal';

const enhanceConfirmModal = compose(
  setPropTypes({
    isOpen: PropTypes.bool,
    title: PropTypes.string.isRequired,
    message: PropTypes.element,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
  }),
  defaultProps({
    isOpen: false,
  })
);

const renderModalMessage = ({ message }) => {
  return (
    <div
      className="modal-body clearfix"
      style={{ maxHeight: '500px', overflow: 'auto', textAlign: 'center' }}>
      {message}
    </div>
  );
};

const renderModalActions = ({ onConfirm, onCancel }) => {
  return (
    <div className="modal-footer" style={{ textAlign: 'center' }}>
      <TextIconButton text="Confirm" icon="icon ion-checkmark" onClick={onConfirm} />
      <TextIconButton text="Cancel" icon="icon ion-close-round" onClick={onCancel} />
    </div>
  );
};

const renderConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  return (
    <Modal isOpen={isOpen} title={title} onCancel={onCancel}>
      {renderModalMessage({ message })}
      {renderModalActions({ onConfirm, onCancel })}
    </Modal>
  );
};

export default enhanceConfirmModal(renderConfirmModal);