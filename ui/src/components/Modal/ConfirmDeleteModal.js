import React from 'react';
import PropTypes from 'prop-types';
import { compose, withProps, setPropTypes } from 'recompose';
import ConfirmModal from 'ui/components/Modal/ConfirmModal';

const enhanceConfirmModal = compose(
  setPropTypes({
    target: PropTypes.string.isRequired,
  }),
  withProps(({ target }) => ({
    title: 'Confirm delete',
    message: (
      <span>
        This will delete the {target} <b>permanently</b>. Are you sure?
      </span>
    )
  })),
);

/**
 * @param {boolean} _.isOpen
 * @param {string} _.target
 * @param {() => void} _.onConfirm
 * @param {() => void} _.onCancel
 */
export default enhanceConfirmModal(ConfirmModal);
