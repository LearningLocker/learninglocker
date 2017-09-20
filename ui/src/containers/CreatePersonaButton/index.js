import React, { PropTypes } from 'react';
import {
  IN_PROGRESS,
  SUCCESS
} from 'ui/redux/modules/models';
import { compose, setPropTypes, defaultProps, withState, withHandlers } from 'recompose';
import { withModel } from 'ui/utils/hocs';
import SmallSpinner from 'ui/components/SmallSpinner';
import CreatePersonaConfirm from 'ui/containers/CreatePersonaConfirm';
import classNames from 'classnames';

const enhance = compose(
  setPropTypes({
    schema: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    white: PropTypes.bool,
    disabled: PropTypes.bool,
  }),
  defaultProps({
    white: false,
    disabled: false,
  }),
  withModel,
  withState('isModalOpen', 'setOpenModel', false),
  withHandlers({
    openModal: ({ setOpenModel }) => () => {
      setOpenModel(true);
    },
    closeModal: ({ setOpenModel }) => () => {
      setOpenModel(false);
    },
  })
);

const renderButtonContent = (createPersonaState) => {
  switch (createPersonaState) {
    case IN_PROGRESS: return (<SmallSpinner />);
    case SUCCESS: return (
      <i className="icon animated fadeIn ion-checkmark" />
    );
    default: return (
      <i className="ion ion-person-add" />
    );
  }
};

const render = ({ white, disabled, model, isModalOpen, openModal, closeModal, schema, id }) => {
  const classes = classNames({
    'btn-sm btn': true,
    'btn-inverse': !white,
    'btn-default flat-white flat-btn': white
  });
  const isDisabled = model.getIn(['errors', 'hasErrors'], disabled);
  return (
    <button
      className={classes}
      title="Create Persona"
      onClick={openModal}
      disabled={isDisabled}
      style={{ width: '33px' }}>
      {renderButtonContent(model.get('createPersonaState'))}
      <CreatePersonaConfirm
        isOpened={isModalOpen}
        schema={schema}
        id={id}
        onClickClose={closeModal} />
    </button>
  );
};

export default enhance(render);
