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
    const mongoOp = operator === 'Out' ? '$nor' : '$or';
    return new Map({ [mongoOp]: criterion });
  }

  getValues = () => {
    const operator = this.getOperator();
    const mongoOp = operator === 'Out' ? '$nor' : '$or';
    return this.props.criterion.get(mongoOp, new List());
  }

  getOperator = () => this.props.criterion.has('$nor') ? 'Out' : 'In';

  onChangeCriterion = (operator, values) =>
    this.props.onCriterionChange(new Map({
      $comment: this.props.criterion.get('$comment'),
    }).merge(this.getCriterionQuery(operator, values)))

  onAddOption = (model) => {
    if (model.isEmpty()) {
      return;
    }
    const values = this.getValues();
    const newValue = this.getOptionQuery(model);
    const added = values.push(newValue)
    this.onChangeCriterion(this.getOperator(), added);
  }

  onRemoveOption = (model) => {
    const values = this.getValues();
    const newValue = this.getOptionQuery(model);
    const filtered = values.filter(value => !value.equals(newValue));

    if (filtered.size === 0) {
      this.props.onDeleteCriterion();
      return;
    }

    this.onChangeCriterion(this.getOperator(), filtered);
  }

  onChangeOperator = operator =>
    this.onChangeCriterion(operator, this.getValues());

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
            onOperatorChange={this.onChangeOperator} />
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
