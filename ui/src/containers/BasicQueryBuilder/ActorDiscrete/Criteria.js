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

  shouldComponentUpdate = nextProps => !(
    this.props.section.equals(nextProps.section) &&
    this.props.criteria.equals(nextProps.criteria)
  );

  changeCriteria = (key, criterion) => {
    this.props.onCriteriaChange(this.props.criteria.set(key, criterion));
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

  renderCriteria = () => (
    <div>
      {this.props.criteria.map(this.renderCriterion.bind(this)).valueSeq()}
    </div>
  );

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
            this.props.criteria.count() > 0 ?
            this.renderCriteria() :
            this.renderEmptyCriteria()
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
