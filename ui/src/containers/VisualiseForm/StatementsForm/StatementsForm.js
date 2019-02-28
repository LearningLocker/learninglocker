import React, { Component, PropTypes } from 'react';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { unflattenAxes } from 'lib/helpers/visualisation';
import { TimezoneSelector, buildDefaultOptionLabel } from 'ui/components/TimezoneSelector';
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
import has$dte from 'ui/utils/queries/has$dte';
import { periodKeys } from 'ui/utils/visualisations/projections/period';
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
    isLoading: PropTypes.bool, // eslint-disable-line react/no-unused-prop-types
    hasMore: PropTypes.bool, // eslint-disable-line react/no-unused-prop-types
    updateModel: PropTypes.func,
    exportVisualisation: PropTypes.func
  }

  static defaultProps = {
    model: new Map(),
  }

  shouldComponentUpdate = nextProps => !(
    this.props.model.equals(nextProps.model) &&
      this.props.orgTimezone === nextProps.orgTimezone &&
      this.props.source === nextProps.source
  )

  onChangeAttr = (attr, e) => this.props.updateModel({
    schema: 'visualisation',
    id: this.props.model.get('_id'),
    path: attr,
    value: e.target.value
  })

  renderEditor = () => (
    <Editor
      model={this.props.model}
      orgTimezone={this.props.orgTimezone}
      exportVisualisation={this.props.exportVisualisation} />
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

  renderTimezoneSelector = () => {
    const axes = unflattenAxes(this.props.model);
    const groupAxes = axes.getIn(['group', 'optionKey'], 'date');
    const groupingHasTimezone = periodKeys.includes(groupAxes);

    const axesxQueryHas$dte = has$dte(this.props.model.get('axesxQuery'));
    const axesyQueryHas$dte = has$dte(this.props.model.get('axesyQuery'));
    const filterHas$dte = has$dte(this.props.model.get('filters'));

    const periodHasOffset = this.props.model.get('previewPeriod') === 'TODAY';

    const shouldDisplay = groupingHasTimezone || axesxQueryHas$dte || axesyQueryHas$dte || filterHas$dte || periodHasOffset;

    return shouldDisplay && (
      <TimezoneSelector
        value={this.props.model.get('timezone', null)}
        onChange={value => this.props.updateModel({
          schema: 'visualisation',
          id: this.props.model.get('_id'),
          path: 'timezone',
          value,
        })}
        defaultOption={{
          label: buildDefaultOptionLabel(this.props.orgTimezone),
          value: this.props.orgTimezone,
        }} />
    );
  }

  renderFormWithResults = () => (
    <div className="row">
      <div className="col-md-6 left-border">
        { this.renderEditor() }
      </div>
      <div
        className="col-md-6">
        <div className="form-group form-inline" style={{ textAlign: 'right' }}>
          { this.renderTimezoneSelector() }
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
    if (this.props.model.has('type')) {
      // include the results if type is selected
      return this.renderFormWithResults();
    }
    // if not type is selected, only show the editor
    return this.renderEditorOnly();
  }
}

export default connect((state, ownProps) => ({
  hasMore: ownProps.hasMore,
  isLoading: ownProps.isLoading,
  source: toggleSourceSelector({ id: ownProps.model.get('_id') })(state)
}), { updateModel, setInMetadata })(StatementsForm);
