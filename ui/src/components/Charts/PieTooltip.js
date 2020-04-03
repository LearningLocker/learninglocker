import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import { round } from 'lodash';
import { CustomTooltip, Label, Value } from './styled';

class PieTooltip extends Component {
  static propTypes = {
    payload: PropTypes.arrayOf(PropTypes.object),
    labels: PropTypes.instanceOf(List),
    active: PropTypes.bool,
    display: PropTypes.func,
  };

  static defaultProps = {
    display: label => label,
  };

  getLabel = label => i => label || `Series ${i + 1}`;

  getValue = entry => i => round(entry.payload[`Series ${i + 1}`], 2);

  renderLabel = entry => (label, i) => (
    <p key={i}>
      {`${this.getLabel(label)(i)} - ${this.getValue(entry)(i)}`}
    </p>
  );

  render = () => {
    const { display, active } = this.props;
    if (active) {
      const { payload, labels } = this.props;
      const entry = payload[0];
      return (
        <CustomTooltip>
          <Label>{`${display(entry.payload.id)}`}</Label>
          <Value>
            {labels.map(this.renderLabel(entry))}
          </Value>
        </CustomTooltip>
      );
    }
    return null;
  }
}
export default PieTooltip;
