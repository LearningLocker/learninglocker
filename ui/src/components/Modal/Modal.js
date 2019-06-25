import React from 'react';
import PropTypes from 'prop-types';
import Portal from 'react-portal';
import { compose, setPropTypes, defaultProps } from 'recompose';

const enhanceConfirmModal = compose(
  setPropTypes({
    isOpen: PropTypes.bool,
    title: PropTypes.string.isRequired,
    onCancel: PropTypes.func.isRequired,
    children: PropTypes.element.isRequired,
  }),
  defaultProps({
    isOpen: false,
  })
);

const renderModalTitle = ({ title, onCancel }) => (
  <div className="modal-header modal-header-bg">
    <button type="button" className="close" aria-label="Close" onClick={onCancel}>
      <span aria-hidden="true">&times;</span>
    </button>
    <h4 className="modal-title">{title}</h4>
  </div>
);

const renderConfirmModal = ({ isOpen, title, onCancel, children }) => (
  <Portal isOpened={isOpen}>
    <span>
      <div className="modal animated fast fadeIn">
        <div className="modal-dialog">
          <div className="modal-content">
            {renderModalTitle({ title, onCancel })}
            {children}
          </div>
        </div>
        <div className="modal-backdrop" onClick={onCancel} />
      </div>
    </span>
  </Portal>
);

export default enhanceConfirmModal(renderConfirmModal);
