import React, { Component, PropTypes } from 'react';
import { Map } from 'immutable';
import classNames from 'classnames';
import Criterion from './Criterion';

export default class Criteria extends Component {
  static propTypes = {
    section: PropTypes.instanceOf(Map),
    criteria: PropTypes.instanceOf(Map),
    onCriteriaChange: PropTypes.func,
    onDeleteCriterion: PropTypes.func,
    onAddCriterion: PropTypes.func,
  }

  shouldComponentUpdate = (nextProps) => {
    const shouldComponentUpdate = !(
      this.props.section.equals(nextProps.section) &&
      this.props.criteria.equals(nextProps.criteria)
    );

    return shouldComponentUpdate;
  }

  changeCriteria = (key, criterion) => {
    const newCriteria = this.props.criteria.set(key, criterion);
    const out = this.props.onCriteriaChange(newCriteria);
    return out;
  }

  addCriterion = () => {
    this.props.onAddCriterion(new Map({
      $or: [],
    }), this.props.section);
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
      onDeleteCriterion={this.deleteCriterion.bind(this, key)}
      key={key} />
  );


  renderCriteria = () => {
    let renderCriteria;

    const key = new Map({
      criterionLabel: 'A',
      criteriaPath: this.props.section.get('keyPath')
    });

    if (this.props.criteria.size === 0) {
      const criteriaKeyDot = this.props.section.get('keyPath').join('.');
      const comment = {
        criterionLabel: 'A',
        criteriaPath: this.props.section.get('keyPath').toJS()
      };

      renderCriteria =
        new Map().set(key.toString(),
          new Map({
            $comment: JSON.stringify(comment),
          }).set(criteriaKeyDot, new Map({ $gt: '' }))
        );
    } else {
      renderCriteria = this.props.criteria;
    }

    return (
      <div>
        {
          renderCriteria.map(this.renderCriterion).valueSeq()
        }
      </div>
    );
  }

  renderEmptyCriteria = () => {
    const criterion = new Map();
    return (
      <Criterion
        section={this.props.section}
        criterion={criterion}
        onCriterionChange={this.createCriterion} />
    );
  }

  render = () => {
    const styles = require('../styles.css');

    const addBtnClasses = classNames(styles.criterionButton, 'btn btn-default btn-xs');

    return (
      <div>
        <div className={styles.criteria}>
          {(
            this.renderCriteria()
          )}
        </div>
        { false && this.props.criteria.count() > 0 &&
          <div className="text-right">
            <button
              className={addBtnClasses}
              onClick={this.addCriterion}>
              <i className="ion-plus-round" />
            </button>
          </div>
        }
      </div>
    );
  }
}
