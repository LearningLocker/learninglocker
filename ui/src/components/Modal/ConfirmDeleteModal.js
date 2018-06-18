import React, { PropTypes } from 'react';
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

export default enhanceConfirmModal(ConfirmModal);

