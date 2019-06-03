import React, { Component, PropTypes } from 'react';
import { Map } from 'immutable';
import { compose, withProps } from 'recompose';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { TEMPLATE_STAGE_INTERMEDIATE } from 'lib/constants/visualise';
import VisualiseResults from 'ui/containers/VisualiseResults';
import SourceResults from 'ui/containers/VisualiseResults/SourceResults';
import { updateModel } from 'ui/redux/modules/models';
import {
  getMetadataSelector,
  setInMetadata
} from 'ui/redux/modules/metadata';
import {
  LAST_30_DAYS,
  LAST_7_DAYS,
  LAST_2_MONTHS,
  LAST_6_MONTHS,
  LAST_24_HOURS,
  LAST_1_YEAR,
  LAST_2_YEARS,
  TODAY
} from 'ui/utils/constants';
import { withSchema } from 'ui/utils/hocs';
import { isContextActivity } from 'ui/utils/visualisations';

import Editor from './Editor';

const SCHEMA = 'visualisation';

export const toggleSourceSelector = ({ id }) => createSelector(
  [getMetadataSelector({ schema: SCHEMA, id })],
  metadata =>
    metadata.get('source')
);

class StatementsForm extends Component {
  static propTypes = {
    model: PropTypes.instanceOf(Map), // visualisation
    orgTimezone: PropTypes.string.isRequired,
    queryBuilderCacheValueModels: PropTypes.instanceOf(Map),
    isLoading: PropTypes.bool, // eslint-disable-line react/no-unused-prop-types
    hasMore: PropTypes.bool, // eslint-disable-line react/no-unused-prop-types
    updateModel: PropTypes.func,
    exportVisualisation: PropTypes.func
  }

  static defaultProps = {
    model: new Map(),
    queryBuilderCacheValueModels: new Map(),
  }

  shouldComponentUpdate = nextProps => !(
    this.props.model.equals(nextProps.model) &&
      (this.props.orgTimezone === nextProps.orgTimezone) &&
      (this.props.source === nextProps.source) &&
      (this.props.queryBuilderCacheValueModels.equals(nextProps.queryBuilderCacheValueModels))
  )

  onChangeAttr = (attr, e) => this.props.updateModel({
    schema: 'visualisation',
    id: this.props.model.get('_id'),
    path: attr,
    value: e.target.value
  })

  hasType = () => this.props.model.has('type')
  hasTemplateId = () => this.props.model.get('templateId', null) !== null
  isOnTemplateIntermediateStage = () => this.props.model.get('templateStage') === TEMPLATE_STAGE_INTERMEDIATE;

  /**
   * @returns {boolean}
   */
  shouldShowNewVisualisation = () =>
    !this.hasType() || (
      this.hasTemplateId() && this.isOnTemplateIntermediateStage()
    )

  renderEditor = () => (
    <Editor
      model={this.props.model}
      orgTimezone={this.props.orgTimezone}
      queryBuilderCacheValueModels={this.props.queryBuilderCacheValueModels}
      exportVisualisation={this.props.exportVisualisation}
      shouldShowNewVisualisation={this.shouldShowNewVisualisation()} />
  );

  renderTimePicker = () => (
    <select
      id={`${this.props.model.get('_id')}previewPeriodInput`}
      className="form-control"
      value={this.props.model.get('previewPeriod')}
      onChange={this.onChangeAttr.bind(null, 'previewPeriod')}>
      <option value={TODAY}>Today</option>
      <option value={LAST_24_HOURS}>Last 24 hours</option>
      <option value={LAST_7_DAYS}>Last 7 days</option>
      <option value={LAST_30_DAYS}>Last 30 days</option>
      <option value={LAST_2_MONTHS}>Last 2 months</option>
      <option value={LAST_6_MONTHS}>Last 6 months</option>
      <option value={LAST_1_YEAR}>Last 1 year</option>
      <option value={LAST_2_YEARS}>Last 2 years</option>
    </select>
  )

  renderFormWithResults = () => (
    <div className="row">
      <div className="col-md-6 left-border">
        { this.renderEditor() }
      </div>
      <div
        className="col-md-6">
        <div className="form-group form-inline" style={{ textAlign: 'right' }}>
          { this.renderTimePicker() }
        </div>
        <div style={{ height: '400px', paddingTop: 5 }}>
          {!this.props.model.get('sourceView') && <VisualiseResults id={this.props.model.get('_id')} />}
          {this.props.model.get('sourceView') &&
            <SourceResults id={this.props.model.get('_id')} />
          }
        </div>
      </div>
    </div>
  );

  renderEditorOnly = () => (
    <div className="row">
      <div className="col-md-12 left-border">
        { this.renderEditor() }
      </div>
    </div>
  );

  render = () => {
    if (this.shouldShowNewVisualisation()) {
      return this.renderEditorOnly();
    }
    return this.renderFormWithResults();
  }
}

const withQueryBuilderCacheValueModels = compose(
  withSchema('querybuildercachevalue'),
  withProps(({ models }) => ({
    queryBuilderCacheValueModels: models,
  }))
);

export default withQueryBuilderCacheValueModels(
  connect(
    (state, ownProps) => {
      const searchString = ownProps.model.getIn(['axesgroup', 'searchString'], '');
      const filter = isContextActivity(searchString) ?
        new Map({ path: new Map({ $eq: `${searchString}.definition.type` }) }) :
        new Map({});

      return {
        hasMore: ownProps.hasMore,
        isLoading: ownProps.isLoading,
        source: toggleSourceSelector({ id: ownProps.model.get('_id') })(state),
        filter,
      };
    },
    { updateModel, setInMetadata }
  )(StatementsForm)
);
