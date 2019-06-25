import React from 'react';
import PropTypes from 'prop-types';
import { compose, withProps, setPropTypes, withState } from 'recompose';
import ConfirmDeleteModal from 'ui/components/Modal/ConfirmDeleteModal';
import IconButton from './IconButton';

const enhanceIconButton = compose(
  setPropTypes({
    target: PropTypes.string.isRequired,
    onConfirm: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
  }),
  withProps({
    title: 'Delete',
    icon: 'icon ion-trash-b',
  }),
  withState('isConfirming', 'setConfirming', false)
);

const renderIconButton = ({ onConfirm, disabled, target, isConfirming, setConfirming }) => (
  <span>
    <IconButton
      title="Delete"
      icon="icon ion-trash-b"
      onClick={() => setConfirming(true)}
      disabled={disabled} />
    <ConfirmDeleteModal
      target={target}
      isOpen={isConfirming}
      onConfirm={() => {
        setConfirming(false);
        onConfirm();
      }}
      onCancel={() => setConfirming(false)} />
  </span>
);

export default enhanceIconButton(renderIconButton);
