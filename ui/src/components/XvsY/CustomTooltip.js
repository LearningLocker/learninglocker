import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { round } from 'lodash';
import styled from 'styled-components';

const Tooltip = styled.div`
  width: 150px;
  margin: 0;
  line-height: 15px;
  border: 2px solid #f5f5f5;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 10px;
  font-size: 12px;
`;

const Label = styled.div`
  margin: 1px;
  color: #ED7030;
  font-weight: 700;
  word-break: break-all;
`;

const Value = styled.p`
  margin: 5px;
  color: #000;
  font-weight: 300;
`;

const TooltipLabel = styled.span`
  max-width: 70%;
  display: inline-block;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  vertical-align: bottom;
`;

class CustomTooltip extends Component {
  static propTypes = {
    payload: PropTypes.arrayOf(PropTypes.object),
    active: PropTypes.bool,
    display: PropTypes.func
  };

  getFirstTenNames = names => names.take(10).join(', ');

  getMoreNames = names => (names.size > 10 ? ', more...' : '');

  renderNames = names => (
    this.getFirstTenNames(names) + this.getMoreNames(names)
  );

  render = () => {
    const { active } = this.props;

    if (active) {
      const { payload } = this.props;
      const names = this.props.display(payload[0].value, payload[1].value);

      return (
        <Tooltip>
          <Label>
            {this.renderNames(names)}
          </Label>
          <Value>
            <TooltipLabel>{`${payload[0].name}`}</TooltipLabel>: {`${round(payload[0].value, 2)}`}
          </Value>
          <Value>
            <TooltipLabel>{`${payload[1].name}`}</TooltipLabel>: {`${round(payload[1].value, 2)}`}
          </Value>
        </Tooltip>
      );
    }

    return null;
  }
}

export default CustomTooltip;
