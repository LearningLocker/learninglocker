import React, { Component, PropTypes } from 'react';
import { Set } from 'immutable';
import Select from './Select/Select';

export default class Operator extends Component {
  static propTypes = {
    operators: PropTypes.instanceOf(Set),
    operator: PropTypes.string,
    onOperatorChange: PropTypes.func,
  }

  shouldComponentUpdate = nextProps => !(
    this.props.operators.equals(nextProps.operators) &&
    this.props.operator === nextProps.operator
  );

  render = () => (
    <Select
      value={this.props.operator}
      onSelect={this.props.onOperatorChange}>
      {this.props.operators}
    </Select>
  );
}
