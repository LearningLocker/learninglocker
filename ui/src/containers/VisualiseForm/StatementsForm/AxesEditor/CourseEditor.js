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
    //type: PropTypes.string.isRequired,
    operator: PropTypes.string,
    value: PropTypes.instanceOf(Map),
    //changeOperator: PropTypes.func.isRequired,
    //changeValue: PropTypes.func.isRequired,
  }

  static defaultProps = {
    operator: 'uniqueCount',
    value: UNIQUENESS_VALUE_OPTS.get('statements'),
  }

  state = {
    operatorInput: '',
  }

  componentWillMount = () => {
    //this.props.changeOperator(this.props.operator);
    //this.props.changeValue(this.props.value);
  }

  changeOperator = newOperator =>
    this.props.changeOperator(newOperator.keySeq().first())

  includes = ys => xs =>
    xs.indexOf(ys) !== -1

  isUniquenessOp = op =>
    this.includes(op)(UNIQUENESS_OPS)

  getOperatorOptions = () =>
    getTypeOpts(this.props.type).filter(this.includes(this.state.operatorInput))

  changeOperatorInput = newOperator =>
    this.setState({ operatorInput: newOperator })

//    find({"type": "http://adlnet.gov/expapi/activities/course"})

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
          useTooltip="true" />
      </div>
    );
  }
}
