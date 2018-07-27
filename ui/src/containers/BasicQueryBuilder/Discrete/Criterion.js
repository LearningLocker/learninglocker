import React, { Component, PropTypes } from 'react';
import { Map, Set, List } from 'immutable';
import { connect } from 'react-redux';
import classNames from 'classnames';
import QueryBuilderAutoComplete from
  'ui/components/AutoComplete2/QueryBuilderAutoComplete';
import Operator from '../Operator';
import { $in, $or } from 'ui/utils/constants';

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

  state = {
    tempOperator: 'In'
  }

  shouldComponentUpdate = ({ section, criterion, filter }, { tempOperator }) => !(
    this.props.section.equals(section) &&
    this.props.criterion.equals(criterion) &&
    this.props.filter.equals(filter) &&
    this.state.tempOperator === tempOperator
  );

  canDeleteCriterion = () =>
    this.props.onDeleteCriterion !== undefined

  getSearchStringToFilter = () =>
    this.props.section.get('searchStringToFilter')

  getOptionQuery = option =>{
    console.log('getOptionQuery', option)
    return this.props.section.get('getModelQuery')(option)
  }

  getOptionDisplay = option =>
    this.props.section.get('getModelDisplay')(option)

  getOptionIdentifier = option =>
    this.props.section.get('getModelIdent')(option)

  getPath = () => `${this.props.filter.getIn(['path', '$eq'])}.id`
  getQueryOption = query =>{
    console.log('getQueryOption(query) and function', query, this.props.section.get('getQueryModel')(query))
    return this.props.section.get('getQueryModel')(query)
  }
  getQueryOperator = () => {
    console.log('​Criterion -> getQueryOperator -> this.props.section', this.props.section, this.props.section.title, this.props.section.get('title'));
   return (this.props.section.get('title') === 'Actor' ? $or : $in);
  }
  
  getCriterionQuery = (operator, criterion) => {
    console.log('cq', this.props, this.getPath())
    switch (true) {
      case operator === 'Out': return new Map({ $nor: criterion });
      case this.getQueryOperator() === $or : return new Map({ $or: criterion.map(item => new Map({ [this.getPath()]: item })) });
      default: return new Map({ [this.getPath()]: new Map({ $in: criterion }) });
    }
  }

  getValues = () => {
    if (!this.canDeleteCriterion()) return new List();
    const operator = this.getOperator();
    let queryValues;
    console.log('​Criterion -> getValues -> .get(this.getQueryOperator())', this.getPath(), this.props);
    // this.props.criterion.get(this.getPath()).get('$or'))
    // console.log('finding path', this.props.criterion.get(this.getPath()).get('$in'))
    // console.log('​Criterion -> getValues -> this.props.criterion.get(this.getPath()).get(this.getQueryOperator())', this.props.criterion.get(this.getPath()).get(this.getQueryOperator()));

    //console.log('getValues props (.criterion chk)',this.props.criterion.get(this.props.filter.getIn(['path','$eq']))), ' and props:',this.props)
    switch (true) {
      case (operator === 'Out'): queryValues = this.props.criterion.get('$nor'); break;
      case this.getQueryOperator() === $or : queryValues = Map(this.props.criterion.get('$or').get(0).get(this.getPath()));console.log('query val or', queryValues);break;
      default: queryValues = this.props.criterion.get(this.getPath()).get(this.getQueryOperator());  console.log('query val in', queryValues)
    }
    return queryValues;
  }

  getOperator = () => {
    if (!this.canDeleteCriterion()) return this.state.tempOperator;
    if (this.props.criterion.has('$nor')) return 'Out';
    return 'In';
  }

  changeCriterion = (operator, values) =>
    this.props.onCriterionChange(new Map({
      $comment: this.props.criterion.get('$comment'),
    }).merge(this.getCriterionQuery(operator, values)))

  changeValues = (values) => {
    console.log('Criterion ChangeValues (this.getOperator,values)', this.getOperator(), values)
    const canDeleteCriterion = values.size === 0 && this.canDeleteCriterion();
    if (canDeleteCriterion) {
      return this.props.onDeleteCriterion();
    }
    return this.changeCriterion(this.getOperator(), values);
  }

  onAddOption = (model) => {
    if (!model.isEmpty()) {
      console.log('onAddOption model', model)
      const values = this.getValues();
      const newValue = this.getOptionQuery(model);
      console.log('newValue',newValue)
      this.changeValues(values.push(newValue));
    }
  }

  onRemoveOption = (model) => {
    const values = this.getValues();
    const newValue = this.getOptionQuery(model);
    console.log('typeof', this.props.section.get('title'), Array.isArray(values), this.props)
    switch (this.props.section.get('title')) {
      case 'Actor': console.log('in or');return this.changeValues(values.filter(value => !value.equals(newValue)));
      default:  console.log('in def');return this.changeValues(values.filter(value => !(value === newValue)));
    }
  }

  changeOperator = (operator) => {
    if (!this.canDeleteCriterion()) {
      return this.setState({ tempOperator: operator });
    }
    return this.changeCriterion(operator, this.getValues());
  }

  render = () => {
    const styles = require('../styles.css');

    const canDeleteCriterion = false && !!this.props.onDeleteCriterion;

    const criterionClasses = classNames(
      styles.criterionValue,
      { [styles.noCriteria]: !canDeleteCriterion }
    );
    const deleteBtnClasses = classNames(styles.criterionButton, 'btn btn-default btn-xs');

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

export default connect((state, ownProps) => {
  if (ownProps.section.has('sourceSchema')) {
    const schema = ownProps.section.get('sourceSchema');
    return { schema };
  }
  const path = ownProps.section.get('keyPath');
  const filter = new Map({ path: new Map({ $eq: path.join('.') }) });
  return { schema: 'querybuildercachevalue', filter };
}, {})(Criterion);
