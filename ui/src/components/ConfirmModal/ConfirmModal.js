import React, { Component, PropTypes } from 'react';
import Portal from 'react-portal';
import { connect } from 'react-redux';
import { compose, setPropTypes, defaultProps } from 'recompose';
import { lowerCase } from 'lodash';
import { deleteModel } from 'ui/redux/modules/models';
import TextIconButton from 'ui/components/TextIconButton/TextIconButton';

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

const renderModalTitle = ({ title, onCancel }) => {
  return (
    <div className="modal-header modal-header-bg">
      <button type="button" className="close" aria-label="Close" onClick={onCancel}>
        <span aria-hidden="true">&times;</span>
      </button>
      <h4 className="modal-title">{title}</h4>
    </div>
  );
};

const renderModalMessage = ({ message }) => {
  return (
    <div
      className="modal-body clearfix"
      style={{ maxHeight: '500px', overflow: 'auto', textAlign: 'center' }}>
      {message}
    </div>
  );
};

const renderConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  return (
    <Portal isOpened={isOpen}>
      <span>
        <div className="modal animated fast fadeIn">
          <div className="modal-dialog">
            <div className="modal-content">
              {renderModalTitle({ title, onCancel })}
              {renderModalMessage({ message })}
              <div className="modal-footer" style={{ textAlign: 'center' }}>
                <TextIconButton text="Confirm" icon="icon ion-checkmark" onClick={onConfirm} />
                <TextIconButton text="Cancel" icon="icon ion-close-round" onClick={onCancel} />
              </div>
            </div>
          </div>
          <div className="modal-backdrop" onClick={onCancel} />
        </div>
      </span>
    </Portal>
  );
};

export default enhanceConfirmModal(renderConfirmModal);