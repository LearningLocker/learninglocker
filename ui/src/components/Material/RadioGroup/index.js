import React, { PropTypes } from 'react';
import { compose, setPropTypes, defaultProps } from 'recompose';

const enhance = compose(
  setPropTypes({
    children: PropTypes.node,
    className: PropTypes.string,
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
    value: PropTypes.string,
  }),
  defaultProps({
    className: '',
    disabled: false,
    onChange: () => null,
  }),
);

const renderRadioButtons = props =>
  React.Children.map(props.children, child =>
    (
      React.cloneElement(child, {
        checked: child.props.value === props.value,
        disabled: props.disabled || child.props.disabled,
        onChange: props.onChange.bind(null, child.props.value),
      })
    )
  );

const render = ({ className, ...props }) =>
  <div data-react-toolbox="radio-group" className={className}>
    {renderRadioButtons(props)}
  </div>;

export default enhance(render);
