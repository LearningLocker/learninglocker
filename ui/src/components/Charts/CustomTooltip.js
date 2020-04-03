import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { round, isUndefined } from 'lodash';
import {
  CustomTooltip as StyledCustomTooltip,
  Label,
  Value
} from './styled';

class CustomTooltip extends Component {
  static propTypes = {
    payload: PropTypes.arrayOf(PropTypes.object),
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    active: PropTypes.bool,
    display: PropTypes.func,
  }

  static defaultProps = {
    display: label => label,
  }

  render = () => {
    const { display, active } = this.props;

    if (!active) {
      return null;
    }

    const { payload, label } = this.props;

    return (
      <StyledCustomTooltip>
        <Label>{`${display(label)}`}</Label>
        <Value>
          {
            payload
              .map(
                val => (
                  !isUndefined(val.value)
                    ? (<p key={val.name}>{`${val.name} - ${round(val.value, 2)}`}</p>)
                    : null
                )
              )
          }
        </Value>
      </StyledCustomTooltip>
    );
  }
}

export default CustomTooltip;
