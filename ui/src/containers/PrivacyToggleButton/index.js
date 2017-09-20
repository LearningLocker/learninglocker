import React, { PropTypes } from 'react';
import { compose, withHandlers, setPropTypes, defaultProps } from 'recompose';
import classNames from 'classnames';
import { withModel } from 'ui/utils/hocs';

const enhance = compose(
  setPropTypes({
    id: PropTypes.string.isRequired,
    schema: PropTypes.string.isRequired,
    small: PropTypes.bool,
    white: PropTypes.bool
  }),
  defaultProps({
    small: false,
    white: false
  }),
  withModel,
  withHandlers({
    togglePrivacy: ({ model, updateModel }) => (event) => {
      const value = !model.get('isPublic', false);
      updateModel({ path: ['isPublic'], value });
      event.stopPropagation();
    }
  })
);

const render = ({ model, togglePrivacy, small, white }) => {
  const isPublic = model.get('isPublic', false);
  const classes = classNames({
    btn: true,
    'btn-sm': !small,
    'btn-xs': small,
    'btn-inverse': !white && !small,
    'flat-white flat-btn': white,
    'btn-default': small || white
  });
  return (
    <button
      onClick={togglePrivacy}
      className={classes}
      style={{ width: '33px' }}>
      {isPublic
        ? <i className="ion ion-unlocked" />
        : <i className="ion ion-locked" />}
    </button>
  );
};

export default enhance(render);
