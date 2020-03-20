import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import {
  CriterionButton,
  CriterionValue,
  CriterionWrapper,
  RadioLabel
} from 'ui/containers/BasicQueryBuilder/styled';
import { uniqueId } from 'lodash';

export class Criterion extends Component {
  static propTypes = {
    section: PropTypes.instanceOf(Map),
    criterion: PropTypes.instanceOf(Map),
    onCriterionChange: PropTypes.func,
    onDeleteCriterion: PropTypes.func,
  }

  shouldComponentUpdate = ({ section, criterion }) => !(
    this.props.section.equals(section) &&
    this.props.criterion.equals(criterion)
  );

  canDeleteCriterion = () =>
    this.props.onDeleteCriterion !== undefined;

  getValueQuery = value =>
    this.props.section.get('getValueQuery')(value);

  getKey = () => this.props.section.get('keyPath').join('.');

  getSubQuery = () => {
    const { criterion } = this.props;
    return criterion.get(this.getKey(), undefined);
  }

  getValue = () => {
    if (!this.canDeleteCriterion()) {
      return '';
    }

    return this.getSubQuery();
  }

  changeCriterion = value => this.props.onCriterionChange(new Map({
    $comment: this.props.criterion.get('$comment'),
  }).set(this.getKey(), value));

  changeValue = (value) => {
    const canDeleteCriterion = value === '' && this.canDeleteCriterion();
    if (canDeleteCriterion) {
      return this.props.onDeleteCriterion();
    }

    this.changeCriterion(value);
  }

  handleValueChange = (event) => {
    const value = event.target.value;

    if (value === '') {
      return this.changeValue(undefined);
    }

    if (value === 'true') {
      return this.changeValue(true);
    } else if (value === 'false') {
      return this.changeValue(false);
    }
  }

  render = () => {
    const canDeleteCriterion = this.canDeleteCriterion();
    const inputName = this.getKey();
    const trueId = uniqueId(`${inputName}-`);
    const falseId = uniqueId(`${inputName}-`);

    return (
      <CriterionWrapper>
        <CriterionValue isFullWidth={!canDeleteCriterion}>
          <div>
            <RadioLabel htmlFor={trueId}>
              True:&nbsp;&nbsp;
            </RadioLabel>
            <input
              id={trueId}
              type="radio"
              name={inputName}
              value="true"
              checked={this.getValue() === true}
              onChange={this.handleValueChange} />
          </div>
          <div>
            <RadioLabel htmlFor={falseId}>
              False:&nbsp;&nbsp;
            </RadioLabel>
            <input
              id={falseId}
              type="radio"
              name={inputName}
              value="false"
              checked={this.getValue() === false}
              onChange={this.handleValueChange} />
          </div>
        </CriterionValue>
        {(canDeleteCriterion &&
          <CriterionButton
            className={'btn btn-default btn-xs'}
            onClick={this.props.onDeleteCriterion} >
            <i className="ion-minus-round" />
          </CriterionButton>
        )}
      </CriterionWrapper>
    );
  }
}

export default Criterion;
