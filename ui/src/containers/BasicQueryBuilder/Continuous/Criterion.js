import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map, Set } from 'immutable';
import classNames from 'classnames';
import moment from 'moment-timezone';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { toTimezone } from 'lib/constants/timezones';
import DatePicker from 'ui/components/Material/DatePicker';
import Operator from '../Operator';
import styles from '../styles.css';
import { symbolOpToMongoOp } from './helpers';

/**
 * @param {immutable.Map} section - {
 *                                    getQueryDisplay: (query: immutable.Map) => string,
 *                                    getValueQuery: (value: string) => immutable.Map,
 *                                    keyPath: immutable.List<string>,
 *                                  }
 * @param {immutable.Map} criterion - {
 *                                      $comment: string,
 *                                      [key:string]: immutable.Map,
 *                                    }
 * @param {(criterion: immutable.Map) => void} onCriterionChange
 * @param {() => void} onDeleteCriterion
 */
class Criterion extends Component {
  static propTypes = {
    timezone: PropTypes.string,
    orgTimezone: PropTypes.string.isRequired,
    section: PropTypes.instanceOf(Map).isRequired,
    criterion: PropTypes.instanceOf(Map).isRequired,
    onCriterionChange: PropTypes.func.isRequired,
    onDeleteCriterion: PropTypes.func.isRequired,
  };

  shouldComponentUpdate = nextProps => !(
    this.props.timezone === nextProps.timezone &&
    this.props.orgTimezone === nextProps.orgTimezone &&
    this.props.section.equals(nextProps.section) &&
    this.props.criterion.equals(nextProps.criterion)
  );

  /**
   * @param {immutable.Map} - query e.g. { $dte: '2019-02-03T09:00Z' }
   * @returns {string} value e.g. '2019-02-03T09:00Z'
   */
  getQueryDisplay = query => this.props.section.get('getQueryDisplay')(query);

  /**
   * @param {string} - value e.g. '2019-02-03T09:00Z'
   * @returns {string} query e.g. { $dte: '2019-02-03T09:00Z' }
   */
  getValueQuery = value => this.props.section.get('getValueQuery')(value);

  /**
   * @returns {string} key e.g. '$timestamp'
   */
  getKey = () =>
    this.props.section.get('keyPath').join('.');

  /**
   * @returns {immutable.Map} - query e.g. { $dte: '2019-02-03T09:00Z' }
   */
  getSubQuery = () =>
    this.props.criterion.get(this.getKey());

  /**
   * Get date object from query
   *
   * @returns {Date}
   */
  getDateValue = () =>
    moment(this.getValue(), 'YYYY-MM-DD').toDate();

  /**
   * Get date time value from query
   * @returns {string} - "{YYYY-MM-DD}T{HH:mm}Z"
   */
  getValue = () => {
    const operator = this.getOperator();
    const subQuery = this.getSubQuery();

    const mongoOp = symbolOpToMongoOp(operator);
    const queryValue = subQuery.get(mongoOp);
    return this.getQueryDisplay(queryValue);
  };

  /**
   * Get operator symbol from props or state
   *
   * @returns {string} symbol operator: "<", ">", "<=", or ">="
   */
  getOperator = () => {
    const subQuery = this.getSubQuery();
    if (subQuery.has('$gt')) return '>';
    if (subQuery.has('$lte')) return '<=';
    if (subQuery.has('$gte')) return '>=';
    return '<';
  };

  /**
   * @param {string} operator
   * @param {string} datetimeString - date time format "{YYYY-MM-DD}T{HH:mm}Z"
   */
  onChangeCriterion = (operator, datetimeString) => {
    const key = this.getKey();
    const mongoOp = symbolOpToMongoOp(operator);

    this.props.onCriterionChange(new Map({
      $comment: this.props.criterion.get('$comment'),
      [key]: new Map({ [mongoOp]: this.getValueQuery(datetimeString) }),
    }));
  };

  /**
   * @param {string} operator - "<", ">", "<=", or ">="
   */
  onChangeOperator = operator =>
    this.onChangeCriterion(operator, this.getValue());

  /**
   * @param {*} - argument of onChange in components/Material/DatePicker
   */
  onChangeDate = (value) => {
    const yyyymmdd = moment.parseZone(value).format('YYYY-MM-DD');
    const timezone = toTimezone(this.props.timezone || this.props.orgTimezone);
    const z = moment(yyyymmdd).tz(timezone).format('Z');
    this.onChangeCriterion(this.getOperator(), `${yyyymmdd}T00:00${z}`);
  };

  render = () => {
    const criterionClasses = classNames(styles.criterionValue, {
      [styles.noCriteria]: false
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
            onOperatorChange={this.onChangeOperator} />
        </div>

        <div className={criterionClasses}>
          <DatePicker
            value={this.getDateValue()}
            onChange={this.onChangeDate} />
        </div>

        <button
          onClick={this.props.onDeleteCriterion}
          className={deleteBtnClasses}>
          <i className="ion-minus-round" />
        </button>
      </div>
    );
  };
}

export default withStyles(styles)(Criterion);
