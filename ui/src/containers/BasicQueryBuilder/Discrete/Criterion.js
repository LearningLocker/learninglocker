import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map, Set, List } from 'immutable';
import { connect } from 'react-redux';
import QueryBuilderAutoComplete from
  'ui/components/AutoComplete2/QueryBuilderAutoComplete';
import { CriterionOperator, CriterionValue, CriterionWrapper } from 'ui/containers/BasicQueryBuilder/styled';
import Operator from '../Operator';
import { opToString, stringToOp, Operators } from './helpers';


class Criterion extends Component {
  static propTypes = {
    section: PropTypes.instanceOf(Map),
    criterion: PropTypes.instanceOf(Map),
    filter: PropTypes.instanceOf(Map),
    onCriterionChange: PropTypes.func,
    onDeleteCriterion: PropTypes.func,
  }

  static defaultProps = {
    filter: new Map(),
  }

  shouldComponentUpdate = ({ section, criterion, filter }) => !(
    this.props.section.equals(section) &&
    this.props.criterion.equals(criterion) &&
    this.props.filter.equals(filter)
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

  getQueryOption = query =>
    this.props.section.get('getQueryModel')(query)

  /**
   * @returns {Operators}
   */
  getOperator = () => {
    const key = this.getQueryKey();
    const subQuery = this.props.criterion.get(key, new Map());
    return subQuery.has(Operators.IN) ? Operators.IN : Operators.NIN;
  }

  /**
   * @returns {immutable.Set}
   */
  getValues = () => {
    const key = this.getQueryKey();
    const subQuery = this.props.criterion.get(key, new Map());
    const operator = this.getOperator();
    return subQuery.get(operator, new List()).toSet();
  }

  /**
   * @param {Operators} operator
   * @param {immutable.Set} values
   * @returns {void}
   */
  onChangeCriterion = (operator, values) => {
    const key = this.getQueryKey();
    this.props.onCriterionChange(new Map({
      $comment: this.props.criterion.get('$comment'),
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
    const values = this.getValues();
    const added = values.add(newValue);
    this.onChangeCriterion(this.getOperator(), added);
  }

  onRemoveOption = (model) => {
    const values = this.getValues();
    const removingValue = this.getOptionQuery(model);
    const removed = values.remove(removingValue);

    if (removed.size === 0) {
      this.props.onDeleteCriterion();
      return;
    }

    this.onChangeCriterion(this.getOperator(), removed);
  }

  onChangeOperator = operator =>
    this.onChangeCriterion(operator, this.getValues());

  render = () => (
    <CriterionWrapper>
      <CriterionOperator>
        <Operator
          operators={new Set(['In', 'Out'])}
          operator={opToString(this.getOperator())}
          onOperatorChange={str => this.onChangeOperator(stringToOp(str))} />
      </CriterionOperator>
      <CriterionValue isFullWidth>
        <QueryBuilderAutoComplete
          values={this.getValues()
            .toList()
            .map(this.getQueryOption)}
          filter={this.props.filter}
          schema={this.props.schema}
          selectOption={this.onAddOption}
          deselectOption={this.onRemoveOption}
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
}, {})(Criterion);
