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
    onAddCriterion: PropTypes.func,
  }

  shouldComponentUpdate = nextProps => !(
    this.props.section.equals(nextProps.section) &&
    this.props.criteria.equals(nextProps.criteria)
  );

  changeCriteria = (key, criterion) => {
    this.props.onCriteriaChange(this.props.criteria.set(key, criterion));
  }

  createCriterion = (criterion) => {
    this.props.onAddCriterion(criterion, this.props.section);
  }

  deleteCriterion = (key) => {
    this.props.onDeleteCriterion(key);
  }

  renderCriterion = (criterion, key) => (
    <Criterion
      section={this.props.section}
      criterion={criterion}
      onCriterionChange={this.changeCriteria.bind(this, key)}
      onDeleteCriterion={this.deleteCriterion.bind(this, key)} />
  );

  renderCriteria = () => (
    <div>
      {this.props.criteria.map(this.renderCriterion.bind(this)).first()}
    </div>
  );

  renderEmptyCriteria = () => (
    <div>
      <Criterion
        section={this.props.section}
        criterion={new Map()}
        onCriterionChange={this.createCriterion} />
    </div>
  )

  render = () => (
    <div>
      {(
        this.props.criteria.count() > 0 ?
          this.renderCriteria() :
          this.renderEmptyCriteria()
      )}
    </div>
  )
}
