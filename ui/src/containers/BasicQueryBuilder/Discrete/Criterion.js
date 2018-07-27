import React, { Component, PropTypes } from 'react';
import { Map, Set, List } from 'immutable';
import { connect } from 'react-redux';
import classNames from 'classnames';
import QueryBuilderAutoComplete from
  'ui/components/AutoComplete2/QueryBuilderAutoComplete';
import Operator from '../Operator';

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

  getQueryOption = query =>{
    console.log('getQueryOption(query) and function', query, this.props.section.get('getQueryModel')(query))
    return this.props.section.get('getQueryModel')(query)
  }

  getPath = () => `${this.props.filter.getIn(['path','$eq'])}.id`
  // createCriterionArray = (props, criterion) => criterion.
  getCriterionQuery = (operator, criterion) => {
    console.log('cq', this.props, `${this.props.filter.getIn(['path','$eq'])}.id`)
    switch (operator) {
      case 'Out': return new Map({ $nor: criterion });
      default: console.log('switch',this.getPath(), new Map({[ `${this.props.filter.getIn(['path','$eq'])}.id` ]: new Map({ $in: criterion })})); return new Map({[ `${this.props.filter.getIn(['path','$eq'])}.id` ]: new Map({ $in: criterion })})
    }
  }

  getActorCriterionQuery = (operator, criterion) => {
    console.log('cq other', this.props, operator, criterion, this.props.filter.getIn(['path','$eq']))
    switch (operator) {
      case 'Out': return new Map({ $nor: criterion });
      default: return new Map({ $or: criterion });
    }
  }

  getValues = () => {
    if (!this.canDeleteCriterion()) return new List();
    console.log('QueryValues', queryValues)
    const operator = this.getOperator();
    let queryValues;
    //console.log('getValues props (.criterion chk)',this.props.criterion.get(this.props.filter.getIn(['path','$eq']))), ' and props:',this.props)
    console.log('​Criterion -> getValues -', this.props)

// this.props.criterion.get(this.props.filter.getIn(['path','$eq'])
    if (operator === 'Out') { 
      queryValues = this.props.criterion.get('$nor');
    } else if (this.props.section.get('title') === 'Actor') {
      queryValues = this.props.criterion.get('$or');
      console.log('queryValues actor', this.props, queryValues)
    } else {
     queryValues = this.props.criterion.get(`${this.props.filter.getIn(['path','$eq'])}.id`).get('$in');
     console.log('queryValues not actor', queryValues)
    }
    return queryValues;
  }

  getActorValues = () => {
    if (!this.canDeleteCriterion()) return new List();
    const operator = this.getOperator();
    let queryValues;
    console.log('QueryValues the second', queryValues)
    //console.log('getValues props (.criterion chk)',this.props.criterion.get(this.props.filter.getIn(['path','$eq']))), ' and props:',this.props)
    if (operator === 'Out') queryValues = this.props.criterion.get('$nor');
    else  queryValues = this.props.criterion.get('$or');
    return queryValues;
  }

  getOperator = () => {
    if (!this.canDeleteCriterion()) return this.state.tempOperator;
    if (this.props.criterion.has('$nor')) return 'Out';
    return 'In';
  }

  changeCriterion = (operator, values) => {
    if (this.props.section.get('title') === 'Actor') {
      this.props.onCriterionChange(new Map({
        $comment: this.props.criterion.get('$comment'),
      }).merge(this.getActorCriterionQuery(operator, values)))
    } else {
      this.props.onCriterionChange(new Map({
        $comment: this.props.criterion.get('$comment'),
      }).merge(this.getCriterionQuery(operator, values)))
    }
  }

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
      console.log('onAddOption model', model, this.props.section,  this.props.section.get('title'))
      const values = this.getValues();
      const newValue = this.getOptionQuery(model);
      console.log('newValue',newValue)
      this.changeValues(values.push(newValue));
    }
  }

  onRemoveOption = (model) => {
    const values = this.getValues();
    const newValue = this.getOptionQuery(model);
    console.log('onRemoveOption (values,newValue)', this.props.section.get('title'), values, newValue)
    if (this.props.section.get('title') === 'Actor') {
      console.log('actor')
      this.changeValues(values.filter(value => !value.equals(newValue)));
    } else {
      console.log('not actor')
      this.changeValues(values.filter(value => !(value === newValue)));
    }
  }

  onRemoveActorOption = (model) => {
    const values = this.getValues();
    const newValue = this.getOptionQuery(model);
    this.changeValues(
      values.filter(value => !value.equals(newValue))
      // values.filter(value => !(value === newValue))
    );
  }

  changeOperator = (operator) => {
    if (!this.canDeleteCriterion()) {
      return this.setState({ tempOperator: operator });
    }
    console.log('change operator')
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
