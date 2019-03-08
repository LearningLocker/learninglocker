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
    operator: 'In'
  }

  shouldComponentUpdate = ({ section, filter }, { operator }) => !(
    this.props.section.equals(section) &&
    this.props.filter.equals(filter) &&
    this.state.operator === operator
  );

  getSearchStringToFilter = () =>
    this.props.section.get('searchStringToFilter')

  getOptionQuery = option =>
    this.props.section.get('getModelQuery')(option)

  getOptionDisplay = option =>
    this.props.section.get('getModelDisplay')(option)

  getOptionIdentifier = option =>
    this.props.section.get('getModelIdent')(option)

  onAddOption = (model) => {
    if (model.isEmpty()) {
      return;
    }
    const newValue = this.getOptionQuery(model);
    const mongoOp = this.state.operator === 'Out' ? '$nor' : '$or';
    const subQuery = new Map({ [mongoOp]: new List([newValue]) });

    const commentQuery = new Map({ $comment: undefined });

    this.props.onCriterionChange(commentQuery.merge(subQuery));
  }

  onChangeOperator = operator => this.setState({ operator });

  render = () => {
    const criterionClasses = classNames(
      styles.criterionValue,
      styles.noCriteria,
    );

    return (
      <div className={styles.criterion}>
        <div className={styles.criterionOperator}>
          <Operator
            operators={new Set(['In', 'Out'])}
            operator={this.state.operator}
            onOperatorChange={op => this.onChangeOperator(op)} />
        </div>
        <div className={criterionClasses} >
          <QueryBuilderAutoComplete
            values={new List()}
            filter={this.props.filter}
            schema={this.props.schema}
            selectOption={this.onAddOption}
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
