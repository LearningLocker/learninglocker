import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List, Map, Set } from 'immutable';
import { connect } from 'react-redux';
import MultiInput from 'ui/components/MultiInput';
import { CriterionOperator, CriterionValue, CriterionWrapper } from 'ui/containers/BasicQueryBuilder/styled';
import Operator from '../Operator';

const Operators = {
  IN: '$in',
  NIN: '$nin'
};

const opToString = op => ((op === Operators.IN) ? 'In' : 'Out');
const stringToOp = str => ((str === 'In') ? Operators.IN : Operators.NIN);

/**
 * Criterion Component
 *
 * expected structure of criterion
 * type keyPathType = string;
 *
 * Map ({
 *   '$comment': string
 *   [keyPathType]: Map ({
 *     [Operator]: List<string>
 *   })
 * })
 */
class Criterion extends Component {
  static propTypes = {
    section: PropTypes.instanceOf(Map),
    criterion: PropTypes.instanceOf(Map),
    onCriterionChange: PropTypes.func,
    onDeleteCriterion: PropTypes.func,
  }

  state = {
    tempOperator: Operators.IN
  }

  shouldComponentUpdate = ({ section, criterion }, { tempOperator }) => !(
    this.props.section.equals(section) &&
    this.props.criterion.equals(criterion) &&
    this.state.tempOperator === tempOperator
  );

  /**
   * @returns {boolean}
   */
  hasQuery = () =>
    this.props.onDeleteCriterion !== undefined

  /**
   * @returns {string}
   */
  getKeyPath = () =>
    this.props.section.get('keyPath', []).join('.')

  /**
   * @returns {immutable.Set<string>}
   */
  getValues = () => {
    if (!this.hasQuery()) return new Set();

    const keyPath = this.getKeyPath();
    const opValues = this.props.criterion.get(keyPath, new Map());
    const operator = opValues.has(Operators.IN) ? Operators.IN : Operators.NIN;
    return opValues.get(operator, new List()).toSet();
  }

  /**
   * @returns {Operators}
   */
  getOperator = () => {
    if (!this.hasQuery()) return this.state.tempOperator;

    const keyPath = this.getKeyPath();
    const opValues = this.props.criterion.get(keyPath, new Map());
    return opValues.has(Operators.IN) ? Operators.IN : Operators.NIN;
  }

  /**
   * @param {Operators} operator
   * @param {immutable.Set<string>} values
   * @returns {void}
   */
  onChangeCriterion = (operator, values) => {
    const keyPath = this.getKeyPath();
    this.props.onCriterionChange(new Map({
      $comment: this.props.criterion.get('$comment'),
      [keyPath]: new Map({
        [operator]: values.toList()
      })
    }));
  }

  /**
   * @param {immutable.Set<string>} values
   * @returns {void}
   */
  onChangeValues = (values) => {
    if (values.size === 0 && this.hasQuery()) {
      this.props.onDeleteCriterion();
      return;
    }
    this.onChangeCriterion(this.getOperator(), values);
  }

  /**
   * @param {string} value
   * @returns {void}
   */
  onAddValue = (value) => {
    const values = this.getValues();
    this.onChangeValues(values.add(value));
  }

  /**
   * @param {string} value
   * @returns {void}
   */
  onRemoveValue = (value) => {
    const values = this.getValues();
    this.onChangeValues(values.delete(value));
  }

  /**
   * @param {Operators} operator
   * @returns {void}
   */
  onChangeOperator = (operator) => {
    if (!this.hasQuery()) {
      this.setState({ tempOperator: operator });
      return;
    }
    this.onChangeCriterion(operator, this.getValues());
  }

  render = () => (
    <CriterionWrapper>
      <CriterionOperator>
        <Operator
          operators={new Set(['In', 'Out'])}
          operator={opToString(this.getOperator())}
          onOperatorChange={str => this.onChangeOperator(stringToOp(str))} />
      </CriterionOperator>
      <CriterionValue isFullWidth>
        <MultiInput
          options={this.getValues()
            .toArray()}
          onAddOption={this.onAddValue}
          onRemoveOption={this.onRemoveValue} />
      </CriterionValue>
    </CriterionWrapper>
  );
}

export default connect((_, ownProps) => {
  const path = ownProps.section.get('keyPath');
  const filter = new Map({ path: new Map({ $eq: path.join('.') }) });
  return { schema: 'querybuildercachevalue', filter };
}, {})(Criterion);
