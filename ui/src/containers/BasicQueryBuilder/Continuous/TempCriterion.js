import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map, Set } from 'immutable';
import moment from 'moment-timezone';
import { toTimezone } from 'lib/constants/timezones';
import DatePicker from 'ui/components/Material/DatePicker';
import { CriterionOperator, CriterionValue, CriterionWrapper } from 'ui/containers/BasicQueryBuilder/styled';
import Operator from '../Operator';
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

  render = () => (
    <CriterionWrapper>
      <CriterionOperator>
        <Operator
          operators={new Set(['>', '<', '>=', '<='])}
          operator={this.state.operator}
          onOperatorChange={this.onChangeOperator} />
      </CriterionOperator>
      <CriterionValue isFullWidth>
        <DatePicker onChange={this.onChangeDate} />
      </CriterionValue>
    </CriterionWrapper>
  )
}

export default TempCriterion;
