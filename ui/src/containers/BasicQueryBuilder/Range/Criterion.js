import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map, Set } from 'immutable';
import {
  CriterionButton,
  CriterionOperator,
  CriterionValue,
  CriterionWrapper
} from 'ui/containers/BasicQueryBuilder/styled';
import Operator from '../Operator';

export class Criterion extends Component {
  static propTypes = {
    section: PropTypes.instanceOf(Map),
    criterion: PropTypes.instanceOf(Map),
    onCriterionChange: PropTypes.func,
    onDeleteCriterion: PropTypes.func,
  }

  state = {
    tempOperator: '>'
  }

  shouldComponentUpdate = ({ section, criterion }, { tempOperator }) => !(
    this.props.section.equals(section) &&
    this.props.criterion.equals(criterion) &&
    this.state.tempOperator === tempOperator
  );

  canDeleteCriterion = () =>
    this.props.onDeleteCriterion !== undefined;

  getValueQuery = value =>
    this.props.section.get('getValueQuery')(value);

  getKey = () => this.props.section.get('keyPath').join('.');

  getSubQuery = () => {
    const { criterion } = this.props;
    return criterion.get(this.getKey(), this.getCriterionSubQuery('>', ''));
  }
  getQueryOption = query =>
    this.props.section.get('getQueryModel')(query)

  getCriterionSubQuery = (operator, value) => {
    switch (operator) {
      case '>': return new Map({ $gt: this.getValueQuery(value) });
      case '>=': return new Map({ $gte: this.getValueQuery(value) });
      case '<=': return new Map({ $lte: this.getValueQuery(value) });
      case '==': return new Map({ $eq: this.getValueQuery(value) });
      case '!=': return new Map({ $ne: this.getValueQuery(value) });
      default: return new Map({ $lt: this.getValueQuery(value) });
    }
  }

  getCriterionQuery = (operator, value) => {
    const key = this.getKey();
    return new Map({
      [key]: this.getCriterionSubQuery(operator, value)
    });
  }

  getValue = () => {
    if (!this.canDeleteCriterion()) return '';
    const operator = this.getOperator();
    const subQuery = this.getSubQuery();
    let queryValue;

    if (operator === '>') queryValue = subQuery.get('$gt');
    else if (operator === '>=') queryValue = subQuery.get('$gte');
    else if (operator === '<=') queryValue = subQuery.get('$lte');
    else if (operator === '!=') queryValue = subQuery.get('$ne');
    else if (operator === '==') queryValue = subQuery.get('$eq');
    else queryValue = subQuery.get('$lt');

    return queryValue;
  }

  getOperator = () => {
    if (!this.canDeleteCriterion()) return this.state.tempOperator;
    const subQuery = this.getSubQuery();
    if (subQuery.has('$gt')) return '>';
    if (subQuery.has('$lte')) return '<=';
    if (subQuery.has('$gte')) return '>=';
    if (subQuery.has('$eq')) return '==';
    if (subQuery.has('$ne')) return '!=';
    return '<';
  }

  getMax = () => this.props.section.get('max', 1);

  getStep = () => this.props.section.get('step', 0.1);

  changeCriterion = (operator, value) => this.props.onCriterionChange(new Map({
    $comment: this.props.criterion.get('$comment'),
  }).merge(this.getCriterionQuery(operator, value)));

  changeValue = (value) => {
    const canDeleteCriterion = value === '' && this.canDeleteCriterion();
    if (canDeleteCriterion) {
      return this.props.onDeleteCriterion();
    }

    this.changeCriterion(this.getOperator(), value);
  }

  changeOperator = (operator) => {
    if (!this.canDeleteCriterion()) {
      return this.setState({ tempOperator: operator });
    }
    this.changeCriterion(operator, this.getValue());
  }

  handleValueChange = (event) => {
    if (event.target.value === '') {
      return this.changeValue('');
    }
    const value = event.target.value * 1;
    return this.changeValue(value);
  }

  render = () => {
    const canDeleteCriterion = this.canDeleteCriterion();

    return (
      <CriterionWrapper>
        <CriterionOperator>
          <Operator
            operators={new Set(['>', '<', '>=', '<=', '==', '!='])}
            operator={this.getOperator()}
            onOperatorChange={this.changeOperator} />
        </CriterionOperator>
        <CriterionValue isFullWidth={!canDeleteCriterion}>
          <input
            type="number"
            min="0"
            max={this.getMax()}
            step={this.getStep()}
            value={this.getValue()}
            onChange={this.handleValueChange} />
        </CriterionValue>
        {(canDeleteCriterion &&
          <CriterionButton
            className={'btn btn-default btn-xs'}
            onClick={this.props.onDeleteCriterion}>
            <i className="ion-minus-round" />
          </CriterionButton>
        )}
      </CriterionWrapper>
    );
  }
}

export default Criterion;
