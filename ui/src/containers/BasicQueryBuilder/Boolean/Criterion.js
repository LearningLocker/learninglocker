import React, { Component, PropTypes } from 'react';
import { Map } from 'immutable';
import classNames from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { uniqueId } from 'lodash';
import styles from '../styles.css';

export class Criterion extends Component {
  static propTypes = {
    section: PropTypes.instanceOf(Map),
    criterion: PropTypes.instanceOf(Map),
    onCriterionChange: PropTypes.func,
    onDeleteCriterion: PropTypes.func,
  }

  shouldComponentUpdate = ({ section, criterion }) => {
    const shouldUpdate = !(
      this.props.section.equals(section) &&
      this.props.criterion.equals(criterion)
    );
    return shouldUpdate;
  };

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

    const subQuery = this.getSubQuery();

    return subQuery;
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
    const criterionClasses = classNames(styles.criterionValue, {
      [styles.noCriteria]: !canDeleteCriterion
    });
    const deleteBtnClasses = classNames(
      styles.criterionButton,
      'btn btn-default btn-xs'
    );
    const radioLabelClasses = classNames(
      styles.radioLabel
    );

    const inputName = this.getKey();

    const trueId = uniqueId(`${inputName}-`);
    const falseId = uniqueId(`${inputName}-`);

    return (
      <div className={styles.criterion}>
        <div className={criterionClasses}>
          <div>
            <label
              className={radioLabelClasses}
              htmlFor={trueId} >
                True:&nbsp;&nbsp;
            </label>
            <input
              id={trueId}
              type="radio"
              name={inputName}
              value="true"
              checked={this.getValue() === true}
              onChange={this.handleValueChange} />
          </div>
          <div>
            <label
              className={radioLabelClasses}
              htmlFor={falseId} >
                False:&nbsp;&nbsp;
            </label>
            <input
              id={falseId}
              type="radio"
              name={inputName}
              value="false"
              checked={this.getValue() === false}
              onChange={this.handleValueChange} />
          </div>
        </div>
        {(canDeleteCriterion &&
          <button
            onClick={this.props.onDeleteCriterion}
            className={deleteBtnClasses}>
            <i className="ion-minus-round" />
          </button>
        )}
      </div>
    );
  }
}

export default withStyles(styles)(Criterion);
