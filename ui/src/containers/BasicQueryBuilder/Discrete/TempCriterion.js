import React, { Component, PropTypes } from 'react';
import { Map, Set, List } from 'immutable';
import { connect } from 'react-redux';
import classNames from 'classnames';
import QueryBuilderAutoComplete from
  'ui/components/AutoComplete2/QueryBuilderAutoComplete';
import Operator from '../Operator';
import styles from '../styles.css';

class Criterion extends Component {
  static propTypes = {
    section: PropTypes.instanceOf(Map),
    filter: PropTypes.instanceOf(Map),
    onCriterionChange: PropTypes.func,
  }

  static defaultProps = {
    filter: new Map(),
  }

  state = {
    tempOperator: 'In'
  }

  shouldComponentUpdate = ({ section, filter }, { tempOperator }) => !(
    this.props.section.equals(section) &&
    this.props.filter.equals(filter) &&
    this.state.tempOperator === tempOperator
  );

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

  getCriterionQuery = (operator, criterion) => {
    switch (operator) {
      case 'Out': return new Map({ $nor: criterion });
      default: return new Map({ $or: criterion });
    }
  }

  getValues = () => new List();

  getOperator = () => this.state.tempOperator;

  changeCriterion = (operator, values) =>
    this.props.onCriterionChange(new Map({
      $comment: undefined,
    }).merge(this.getCriterionQuery(operator, values)))

  changeValues = values =>
    this.changeCriterion(this.getOperator(), values);

  onAddOption = (model) => {
    if (!model.isEmpty()) {
      const values = this.getValues();
      const newValue = this.getOptionQuery(model);
      this.changeValues(values.push(newValue));
    }
  }

  onRemoveOption = (model) => {
    const values = this.getValues();
    const newValue = this.getOptionQuery(model);

    this.changeValues(
      values.filter(value => !value.equals(newValue))
    );
  }

  changeOperator = operator =>
    this.setState({ tempOperator: operator });

  render = () => {
    const criterionClasses = classNames(
      styles.criterionValue,
      { [styles.noCriteria]: true }
    );

    return (
      <div className={styles.criterion}>
        <div className={styles.criterionOperator}>
          <Operator
            operators={new Set(['In', 'Out'])}
            operator={this.getOperator()}
            onOperatorChange={this.changeOperator} />
        </div>
        <div className={criterionClasses} >
          <QueryBuilderAutoComplete
            values={this.getValues().map(this.getQueryOption)}
            filter={this.props.filter}
            schema={this.props.schema}
            selectOption={this.onAddOption}
            deselectOption={this.onRemoveOption}
            parseOption={this.getOptionDisplay}
            searchStringToFilter={this.getSearchStringToFilter()}
            parseOptionTooltip={this.getOptionIdentifier} />
        </div>
      </div>
    );
  }
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
