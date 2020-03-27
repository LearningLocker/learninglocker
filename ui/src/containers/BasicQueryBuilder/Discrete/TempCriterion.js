import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map, Set, List } from 'immutable';
import { connect } from 'react-redux';
import QueryBuilderAutoComplete from
  'ui/components/AutoComplete2/QueryBuilderAutoComplete';
import { CriterionOperator, CriterionValue, CriterionWrapper } from 'ui/containers/BasicQueryBuilder/styled';
import Operator from '../Operator';
import { opToString, stringToOp, Operators } from './helpers';

class TempCriterion extends Component {
  static propTypes = {
    section: PropTypes.instanceOf(Map),
    filter: PropTypes.instanceOf(Map),
    onCriterionChange: PropTypes.func,
  }

  static defaultProps = {
    filter: new Map(),
  }

  state = {
    operator: Operators.IN
  }

  shouldComponentUpdate = ({ section, filter }, { operator }) => !(
    this.props.section.equals(section) &&
    this.props.filter.equals(filter) &&
    this.state.operator === operator
  );

  /**
   * @returns {string}
   */
  getQueryKey = () =>
    this.props.section.get('getQueryKey', '')

  getSearchStringToFilter = () =>
    this.props.section.get('searchStringToFilter')

  getOptionQuery = option =>
    this.props.section.get('getModelQuery')(option)

  getOptionDisplay = option =>
    this.props.section.get('getModelDisplay')(option)

  getOptionIdentifier = option =>
    this.props.section.get('getModelIdent')(option)

  /**
   * @param {Operators} operator
   * @param {immutable.Set<string>} values
   * @returns {void}
   */
  onChangeCriterion = (operator, values) => {
    const key = this.getQueryKey();
    this.props.onCriterionChange(new Map({
      $comment: undefined,
      [key]: new Map({
        [operator]: values.toList()
      })
    }));
  }

  onAddOption = (model) => {
    if (model.isEmpty()) {
      return;
    }
    const newValue = this.getOptionQuery(model);
    const newValues = new Set([newValue]);
    this.onChangeCriterion(this.state.operator, newValues);
  }

  onChangeOperator = operator => this.setState({ operator });

  render = () => (
    <CriterionWrapper>
      <CriterionOperator>
        <Operator
          operators={new Set(['In', 'Out'])}
          operator={opToString(this.state.operator)}
          onOperatorChange={str => this.onChangeOperator(stringToOp(str))} />
      </CriterionOperator>
      <CriterionValue isFullWidth>
        <QueryBuilderAutoComplete
          values={new List()}
          filter={this.props.filter}
          schema={this.props.schema}
          selectOption={this.onAddOption}
          parseOption={this.getOptionDisplay}
          searchStringToFilter={this.getSearchStringToFilter()}
          parseOptionTooltip={this.getOptionIdentifier} />
      </CriterionValue>
    </CriterionWrapper>
  );
}

export default connect((_, ownProps) => {
  if (ownProps.section.has('sourceSchema')) {
    const schema = ownProps.section.get('sourceSchema');
    return { schema };
  }
  const path = ownProps.section.get('keyPath');
  const filter = new Map({ path: new Map({ $eq: path.join('.') }) });
  return { schema: 'querybuildercachevalue', filter };
}, {})(TempCriterion);
