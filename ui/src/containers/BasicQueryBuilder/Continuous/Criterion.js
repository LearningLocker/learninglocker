import React, { Component, PropTypes } from 'react';
import { Map, Set } from 'immutable';
import DatePicker from 'ui/components/Material/DatePicker';
import classNames from 'classnames';
import moment from 'moment';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import Operator from '../Operator';
import styles from '../styles.css';

/**
 * @param {string} symbol - "<", ">", "<=", or ">="
 * @return {string} - mongodb's comparison query operator
 */
const symbolToMongoOp = (symbol) => {
  switch (symbol) {
    case '>': return '$gt';
    case '>=': return '$gte';
    case '<=': return '$lte';
    case '<':
    default: return '$lt';
  }
};

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
    const mongoOp = symbolToMongoOp(operator);
    return new Map({ [mongoOp]: this.getValueQuery(value) });
  }

  getCriterionQuery = (operator, value) => {
    const key = this.getKey();
    return new Map({
      [key]: this.getCriterionSubQuery(operator, value)
    });
  }

  /**
   * Get date object from query
   *
   * @returns {string|Date}
   */
  getDateValue = () => {
    if (!this.getValue()) {
      return '';
    }
    return moment(this.getValue(), 'YYYY-MM-DD').toDate();
  }

  /**
   * Get time string from query
   *
   * @returns {string} "T{HH:mm}Z" is expected
   */
  getTimeValue = () => (this.getValue() || '').slice(10) || 'T00:00Z';

  /**
   * Get date time value from query
   * @returns {string} - "{YYYY-MM-DD}T{HH:mm}Z"
   */
  getValue = () => {
    if (!this.canDeleteCriterion()) return '';
    const operator = this.getOperator();
    const subQuery = this.getSubQuery();

    const mongoOp = symbolToMongoOp(operator);
    const queryValue = subQuery.get(mongoOp);
    return this.getQueryDisplay(queryValue);
  }

  /**
   * Get operator symbol from props or state
   *
   * @returns {string} "<", ">", "<=", or ">="
   */
  getOperator = () => {
    if (!this.canDeleteCriterion()) return this.state.tempOperator;
    const subQuery = this.getSubQuery();
    if (subQuery.has('$gt')) return '>';
    if (subQuery.has('$lte')) return '<=';
    if (subQuery.has('$gte')) return '>=';
    return '<';
  }

  /**
   * @param {string} operator
   * @param {string} datetimeString - date time format "{YYYY-MM-DD}T{HH:mm}Z"
   */
  changeCriterion = (operator, datetimeString) => {
    this.props.onCriterionChange(new Map({
      $comment: this.props.criterion.get('$comment'),
    }).merge(this.getCriterionQuery(operator, datetimeString)));
  }

  /**
   * @param {string} operator - "<", ">", "<=", or ">="
   */
  changeOperator = (operator) => {
    if (!this.canDeleteCriterion()) {
      return this.setState({ tempOperator: operator });
    }
    this.changeCriterion(operator, this.getValue());
  }

  /**
   * called when date picker onChange
   *
   * @param {*} - argument of onChange in components/Material/DatePicker
   */
  onChangeDatePicker = (value) => {
    const dateString = moment(value).format('YYYY-MM-DD');
    const canDeleteCriterion = dateString === '' && this.canDeleteCriterion();
    if (canDeleteCriterion) {
      this.props.onDeleteCriterion();
      return;
    }

    this.changeCriterion(this.getOperator(), `${dateString}${this.getTimeValue()}`);
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
            onChange={this.onChangeDatePicker} />
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
