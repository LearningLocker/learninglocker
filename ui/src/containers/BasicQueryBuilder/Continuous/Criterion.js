import React, { Component, PropTypes } from 'react';
import { Map, Set } from 'immutable';
import DatePicker from 'ui/components/Material/DatePicker';
import classNames from 'classnames';
import moment from 'moment';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import Operator from '../Operator';
import styles from '../styles.css';

class Criterion extends Component {
  static propTypes = {
    section: PropTypes.instanceOf(Map),
    criterion: PropTypes.instanceOf(Map),
    onCriterionChange: PropTypes.func,
    onDeleteCriterion: PropTypes.func,
  }

  state = {
    tempOperator: '<'
  }

  shouldComponentUpdate = ({ section, criterion }, { tempOperator }) => !(
    this.props.section.equals(section) &&
    this.props.criterion.equals(criterion) &&
    this.state.tempOperator === tempOperator
  );

  canDeleteCriterion = () =>
    this.props.onDeleteCriterion !== undefined;

  getQueryDisplay = query =>
    this.props.section.get('getQueryDisplay')(query);

  getValueQuery = value =>
    this.props.section.get('getValueQuery')(value);

  getKey = () =>
    this.props.section.get('keyPath').join('.');

  getSubQuery = () => {
    const { criterion } = this.props;
    return criterion.get(this.getKey(), this.getCriterionSubQuery('>', ''));
  }

  getCriterionSubQuery = (operator, value) => {
    switch (operator) {
      case '>': return new Map({ $gt: this.getValueQuery(value) });
      case '>=': return new Map({ $gte: this.getValueQuery(value) });
      case '<=': return new Map({ $lte: this.getValueQuery(value) });
      default: return new Map({ $lt: this.getValueQuery(value) });
    }
  }

  getCriterionQuery = (operator, value) => {
    const key = this.getKey();
    return new Map({
      [key]: this.getCriterionSubQuery(operator, value)
    });
  }

  getDateValue = () => {
    if (!this.getValue()) {
      return '';
    }
    return moment(this.getValue(), 'YYYY-MM-DD').toDate();
  }
  getTimeValue = () => (this.getValue() || '').slice(10) || 'T00:00Z';

  getValue = () => {
    if (!this.canDeleteCriterion()) return '';
    const operator = this.getOperator();
    const subQuery = this.getSubQuery();
    let queryValue;

    if (operator === '>') queryValue = subQuery.get('$gt');
    else if (operator === '>=') queryValue = subQuery.get('$gte');
    else if (operator === '<=') queryValue = subQuery.get('$lte');
    else queryValue = subQuery.get('$lt');

    return this.getQueryDisplay(queryValue);
  }

  getOperator = () => {
    if (!this.canDeleteCriterion()) return this.state.tempOperator;
    const subQuery = this.getSubQuery();
    if (subQuery.has('$gt')) return '>';
    if (subQuery.has('$lte')) return '<=';
    if (subQuery.has('$gte')) return '>=';
    return '<';
  }

  changeCriterion = (operator, value) => {
    this.props.onCriterionChange(new Map({
      $comment: this.props.criterion.get('$comment'),
    }).merge(this.getCriterionQuery(operator, value)));
  }

  changeValue = (value) => {
    const canDeleteCriterion = value === '' && this.canDeleteCriterion();
    if (canDeleteCriterion) {
      return this.props.onDeleteCriterion();
    }

    this.changeCriterion(this.getOperator(), `${value}${this.getTimeValue()}`);
  }

  changeOperator = (operator) => {
    if (!this.canDeleteCriterion()) {
      return this.setState({ tempOperator: operator });
    }
    this.changeCriterion(operator, this.getValue());
  }

  handleValueChange = (value) => {
    this.changeValue(
      moment(value).format('YYYY-MM-DD')
    );
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

    return (
      <div className={styles.criterion}>
        <div className={styles.criterionOperator}>
          <Operator
            operators={new Set(['>', '<', '>=', '<='])}
            operator={this.getOperator()}
            onOperatorChange={this.changeOperator} />
        </div>
        <div className={criterionClasses}>
          <DatePicker
            value={this.getDateValue()}
            onChange={this.handleValueChange} />
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
