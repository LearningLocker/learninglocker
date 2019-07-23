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

const DEFAULT_SYMBOL_OP = '<';

/**
 * Temporally Continuous Criterion
 *
 * expected to be used when criteria is empty
 */
class TempCriterion extends Component {
  static propTypes = {
    timezone: PropTypes.string,
    orgTimezone: PropTypes.string.isRequired,
    section: PropTypes.instanceOf(Map).isRequired,
    onCriterionChange: PropTypes.func.isRequired,
  }

  state = {
    operator: DEFAULT_SYMBOL_OP
  }

  shouldComponentUpdate = (nextProps, nextState) => !(
    this.props.timezone === nextProps.timezone &&
    this.props.orgTimezone === nextProps.orgTimezone &&
    this.props.section.equals(nextProps.section) &&
    this.state.operator === nextState.operator
  );

  getValueQuery = value =>
    this.props.section.get('getValueQuery')(value);

  getKey = () =>
    this.props.section.get('keyPath').join('.');

  /**
   * @param {string} operator - "<", ">", "<=", or ">="
   */
  onChangeOperator = operator => this.setState({ operator });

  /**
   * @param {*} - argument of onChange in components/Material/DatePicker
   */
  onChangeDate = (value) => {
    const yyyymmdd = moment(value).format('YYYY-MM-DD');
    const timezone = toTimezone(this.props.timezone || this.props.orgTimezone);
    const z = moment(yyyymmdd).tz(timezone).format('Z');
    const datetimeString = `${yyyymmdd}T00:00${z}`;

    const key = this.getKey();
    const mongoOp = symbolOpToMongoOp(this.state.operator);

    this.props.onCriterionChange(new Map({
      [key]: new Map({
        [mongoOp]: this.getValueQuery(datetimeString)
      })
    }));
  }

  render = () => {
    const criterionClasses = classNames(styles.criterionValue, {
      [styles.noCriteria]: true
    });

    return (
      <div className={styles.criterion}>
        <div className={styles.criterionOperator}>
          <Operator
            operators={new Set(['>', '<', '>=', '<='])}
            operator={this.state.operator}
            onOperatorChange={this.onChangeOperator} />
        </div>
        <div className={criterionClasses}>
          <DatePicker
            onChange={this.onChangeDate} />
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(TempCriterion);
