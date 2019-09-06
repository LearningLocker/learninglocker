import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List, Map, fromJS } from 'immutable';
import { connect } from 'react-redux';
import {
  XVSY,
  STATEMENTS,
  LEADERBOARD,
  FREQUENCY,
  COUNTER,
  PIE,
  TEMPLATE_ACTIVITY_OVER_TIME,
  TEMPLATE_LAST_7_DAYS_STATEMENTS,
  TEMPLATE_MOST_ACTIVE_PEOPLE,
  TEMPLATE_MOST_POPULAR_ACTIVITIES,
  TEMPLATE_MOST_POPULAR_VERBS,
  TEMPLATE_WEEKDAYS_ACTIVITY,
  TEMPLATE_CURATR_INTERACTIONS_VS_ENGAGEMENT,
  TEMPLATE_CURATR_COMMENT_COUNT,
  TEMPLATE_CURATR_LEARNER_INTERACTIONS_BY_DATE_AND_VERB,
  TEMPLATE_CURATR_USER_ENGAGEMENT_LEADERBOARD,
  TEMPLATE_CURATR_PROPORTION_OF_SOCIAL_INTERACTIONS,
  TEMPLATE_CURATR_ACTIVITIES_WITH_MOST_COMMENTS,
} from 'lib/constants/visualise';
import { updateModel } from 'ui/redux/modules/models';
import TabbedQueriesBuilder from 'ui/components/TabbedQueriesBuilder';

// [Viz Refactor] TODO: Remove this component
class VisualiseFilterForm extends Component {
  static propTypes = {
    model: PropTypes.instanceOf(Map), // visualisation
    orgTimezone: PropTypes.string.isRequired,
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

  onChangeTimezone = (value) => {
    this.props.updateModel({
      schema: 'visualisation',
      id: this.props.model.get('_id'),
      path: ['timezone'],
      value
    });
  }

  renderTabbedQueryBuilder = (labelled = true, defaults = {}, text = 'Build your query') => {
    const queries = this.props.model.get('filters', new List());

    return (
      <div>
        <label htmlFor="tabbedQueriesBuilder" className="clearfix" style={{ marginLeft: '3px' }}>
          {text}
        </label>
        <TabbedQueriesBuilder
          timezone={this.props.model.get('timezone', null)}
          orgTimezone={this.props.orgTimezone}
          queries={queries}
          labelled={labelled}
          componentBasePath={
            new List(['visualise', this.props.model.get('_id')])
          }
          onChangeQuery={this.onChangeQuery}
          onChangeLabel={this.onChangeLabel}
          onDeleteQuery={this.onDeleteQuery}
          onChangeColor={this.onChangeColor}
          onChangeTimezone={this.onChangeTimezone}
          defaults={fromJS(defaults)} />
      </div>
    );
  };

  renderStatements = () =>
    this.renderTabbedQueryBuilder(false, { who: { expanded: true } });

  renderLeaderboard = () =>
    this.renderTabbedQueryBuilder(false, { verbs: { expanded: true } });

  renderCounter = () =>
    this.renderTabbedQueryBuilder(false, { verbs: { expanded: true } });

  renderXvsY = () => this.renderTabbedQueryBuilder();

  renderFrequency = () => this.renderTabbedQueryBuilder();

  renderDefault = () => this.renderTabbedQueryBuilder();

  render = () => {
    const { model } = this.props;
    const type = model.get('type');
    const queries = model.get('filters', new List());

    switch (type) {
      case XVSY:
      case TEMPLATE_CURATR_INTERACTIONS_VS_ENGAGEMENT:
        return this.renderXvsY();
      case FREQUENCY:
      case TEMPLATE_ACTIVITY_OVER_TIME:
        return this.renderFrequency();
      case STATEMENTS:
      case TEMPLATE_WEEKDAYS_ACTIVITY:
      case TEMPLATE_CURATR_LEARNER_INTERACTIONS_BY_DATE_AND_VERB:
        return this.renderStatements(queries);
      case LEADERBOARD:
      case TEMPLATE_MOST_ACTIVE_PEOPLE:
      case TEMPLATE_MOST_POPULAR_ACTIVITIES:
      case TEMPLATE_MOST_POPULAR_VERBS:
      case TEMPLATE_CURATR_USER_ENGAGEMENT_LEADERBOARD:
      case TEMPLATE_CURATR_ACTIVITIES_WITH_MOST_COMMENTS:
        return this.renderLeaderboard(queries);
      case COUNTER:
      case TEMPLATE_LAST_7_DAYS_STATEMENTS:
      case TEMPLATE_CURATR_COMMENT_COUNT:
        return this.renderCounter();
      case PIE:
      case TEMPLATE_CURATR_PROPORTION_OF_SOCIAL_INTERACTIONS:
      default:
        return this.renderDefault(queries);
    }
  };
}

export default connect(() => ({}), { updateModel })(VisualiseFilterForm);
