import React, { Component, PropTypes } from 'react';
import { List, Map, fromJS } from 'immutable';
import { updateModel } from 'ui/redux/modules/models';
import { connect } from 'react-redux';
import TabbedQueriesBuilder from 'ui/components/TabbedQueriesBuilder';

import {
  XVSY,
  STATEMENTS,
  POPULARACTIVITIES,
  LEADERBOARD,
  FREQUENCY,
} from '../../utils/constants';

class VisualiseFilterForm extends Component {
  static propTypes = {
    model: PropTypes.instanceOf(Map),
    updateModel: PropTypes.func
  };

  static defaultProps = {
    model: new Map()
  };

  onChangeQuery = (index, nextQuery) => {
    const { model } = this.props;
    const oldFilters = model.get('filters');
    const newFilters = oldFilters.setIn([index, '$match'], nextQuery);
    this.props.updateModel({
      schema: 'visualisation',
      id: model.get('_id'),
      path: ['filters'],
      value: newFilters
    });
  };

  onChangeLabel = (index, event) => {
    const { model } = this.props;
    const nextLabel = event.target.value;
    const modelId = model.get('_id');
    const oldFilters = model.get('filters');
    const newFilters = oldFilters.setIn([index, 'label'], nextLabel);
    this.props.updateModel({
      schema: 'visualisation',
      id: modelId,
      path: ['filters'],
      value: newFilters
    });
  };

  onDeleteQuery = (index) => {
    const { model } = this.props;
    const queries = model.get('filters');
    const newQueries = queries.delete(index);
    this.props.updateModel({
      schema: 'visualisation',
      id: model.get('_id'),
      path: 'filters',
      value: newQueries
    });
  };

  onChangeColor = (index, nextColor) => {
    const { model } = this.props;
    const modelId = model.get('_id');
    const oldFilters = model.get('filters');
    const newFilters = oldFilters.setIn([index, 'color'], nextColor);
    this.props.updateModel({
      schema: 'visualisation',
      id: modelId,
      path: ['filters'],
      value: newFilters
    });
  }

  renderTabbedQueryBuilder = (labelled = true, defaults = {}) => {
    const queries = this.props.model.get('filters', new List());

    return (
      <div>
        <label htmlFor="tabbedQueriesBuilder" className="clearfix">
          Build your query
        </label>
        <TabbedQueriesBuilder
          queries={queries}
          labelled={labelled}
          componentBasePath={
            new List(['visualise', this.props.model.get('_id')])
          }
          onQueryChange={this.onChangeQuery}
          onChangeLabel={this.onChangeLabel}
          onDeleteQuery={this.onDeleteQuery}
          onChangeColor={this.onChangeColor}
          defaults={fromJS(defaults)} />
      </div>
    );
  };

  renderStatements = () =>
    this.renderTabbedQueryBuilder(false, { who: { expanded: true } });

  renderLeaderboard = () =>
    this.renderTabbedQueryBuilder(false, { verbs: { expanded: true } });

  renderPopularActivities = () =>
    this.renderTabbedQueryBuilder(false, { objects: { expanded: true } });

  renderXvsY = () => this.renderTabbedQueryBuilder();

  renderFrequency = () => this.renderTabbedQueryBuilder();

  renderDefault = () => this.renderTabbedQueryBuilder();

  render = () => {
    const { model } = this.props;
    const type = model.get('type');
    const queries = model.get('filters', new List());

    switch (type) {
      case XVSY:
        return this.renderXvsY();
      case FREQUENCY:
        return this.renderFrequency();
      case STATEMENTS:
        return this.renderStatements(queries);
      case LEADERBOARD:
        return this.renderLeaderboard(queries);
      case POPULARACTIVITIES:
        return this.renderPopularActivities();
      default:
        return this.renderDefault(queries);
    }
  };
}

export default connect(() => ({}), { updateModel })(VisualiseFilterForm);
