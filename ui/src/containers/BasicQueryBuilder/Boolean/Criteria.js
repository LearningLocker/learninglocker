import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import Criterion from './Criterion';

export default class Criteria extends Component {
  static propTypes = {
    section: PropTypes.instanceOf(Map),
    criteria: PropTypes.instanceOf(Map),
    onCriteriaChange: PropTypes.func,
    onDeleteCriterion: PropTypes.func,
  }

  shouldComponentUpdate = nextProps => !(
    this.props.section.equals(nextProps.section) &&
    this.props.criteria.equals(nextProps.criteria)
  );

  changeCriteria = (key, criterion) => {
    const newCriteria = this.props.criteria.set(key, criterion);
    return this.props.onCriteriaChange(newCriteria);
  }

  deleteCriterion = (key) => {
    this.props.onDeleteCriterion(key);
  }

  getCriteria = () => {
    if (this.props.criteria.size > 0) {
      return this.props.criteria;
    }

    const key = (new Map({
      criterionLabel: 'A',
      criteriaPath: this.props.section.get('keyPath')
    })).toString();

    const comment = JSON.stringify({
      criterionLabel: 'A',
      criteriaPath: this.props.section.get('keyPath').toJS()
    });

    const criteriaKeyDot = this.props.section.get('keyPath').join('.');

    return new Map({
      [key]: new Map({
        $comment: comment,
        [criteriaKeyDot]: undefined,
      })
    });
  }

  renderCriterion = (criterion, key) => (
    <Criterion
      section={this.props.section}
      criterion={criterion}
      onCriterionChange={this.changeCriteria.bind(this, key)}
      onDeleteCriterion={this.deleteCriterion.bind(this, key)}
      key={key} />
  );

  render = () => (
    <div>
      {
        this
          .getCriteria()
          .map(this.renderCriterion)
          .valueSeq()
      }
    </div>
  );
}
