import React, { Component, PropTypes } from 'react';
import { Map } from 'immutable';
import FullActivitiesList from 'ui/containers/FullActivitiesList';
import {
  getTypeOpts,
  UNIQUENESS_OPS,
  VALUE_OPTS,
  UNIQUENESS_VALUE_OPTS,
} from 'ui/utils/visualisations/localOptions';

export default class CourseEditor extends Component {
  static propTypes = {
    operator: PropTypes.string,
    value: PropTypes.instanceOf(Map),
    model: PropTypes.instanceOf(Map),
    updateModel: PropTypes.func.isRequired,
  }

  static defaultProps = {
    operator: 'uniqueCount',
    value: UNIQUENESS_VALUE_OPTS.get('statements'),
  }

  state = {
    operatorInput: '',
  }

  changeOperator = newOperator =>
    this.props.changeOperator(newOperator.keySeq().first())

  includes = ys => xs =>
    xs.indexOf(ys) !== -1

  isUniquenessOp = op =>
    UNIQUENESS_OPS.includes(op)

  getOperatorOptions = () =>
    getTypeOpts(this.props.type).filter(this.includes(this.state.operatorInput))

  changeOperatorInput = newOperator =>
    this.setState({ operatorInput: newOperator })

  render = () => {
    const { operator, value } = this.props;
    const hasUniquenessOp = this.isUniquenessOp(operator);

    return (
      <div>
        <FullActivitiesList
          selectedOption={value}
          localOptions={hasUniquenessOp ? UNIQUENESS_VALUE_OPTS : VALUE_OPTS}
          filter={new Map(hasUniquenessOp ? {} : {
            valueType: new Map({ $eq: 'Number' })
          })}
          onSelectOption={this.props.changeValue}
          useTooltip="true"
          model={this.props.model}
          updateModel={this.props.updateModel} />
      </div>
    );
  }
}
