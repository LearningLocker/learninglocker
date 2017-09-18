import React, { Component, PropTypes } from 'react';
import { Map } from 'immutable';
import { updateModel } from 'ui/redux/modules/models';
import { connect } from 'react-redux';
import VisualiseResults from 'ui/containers/VisualiseResults';
import {
  LAST_30_DAYS,
  LAST_7_DAYS,
  LAST_2_MONTHS,
  LAST_6_MONTHS,
  LAST_24_HOURS,
  LAST_1_YEAR,
  LAST_2_YEARS
} from 'ui/utils/constants';
import Editor from './Editor';

class StatementsForm extends Component {
  static propTypes = {
    model: PropTypes.instanceOf(Map),
    isLoading: PropTypes.bool, // eslint-disable-line react/no-unused-prop-types
    filter: PropTypes.instanceOf(Map), // eslint-disable-line react/no-unused-prop-types
    hasMore: PropTypes.bool, // eslint-disable-line react/no-unused-prop-types
    updateModel: PropTypes.func,
    exportVisualisation: PropTypes.func
  }

  static defaultProps = {
    model: new Map()
  }

  shouldComponentUpdate = nextProps => !(
    this.props.model.equals(nextProps.model)
  )

  onChangeAttr = (attr, e) => this.props.updateModel({
    schema: 'visualisation',
    id: this.props.model.get('_id'),
    path: attr,
    value: e.target.value
  })

  render = () => {
    const { model } = this.props;
    return (
      <div className="row">
        <div className="col-md-6 left-border">
          <Editor
            model={model}
            exportVisualisation={this.props.exportVisualisation} />
        </div>

        <div
          className="col-md-6">
          <div className="form-group form-inline" style={{ textAlign: 'right' }}>
            <select
              id={`${model.get('_id')}previewPeriodInput`}
              className="form-control"
              value={model.get('previewPeriod')}
              onChange={this.onChangeAttr.bind(null, 'previewPeriod')}>
              <option value={LAST_24_HOURS}>Last 24 hours</option>
              <option value={LAST_7_DAYS}>Last 7 days</option>
              <option value={LAST_30_DAYS}>Last 30 days</option>
              <option value={LAST_2_MONTHS}>Last 2 months</option>
              <option value={LAST_6_MONTHS}>Last 6 months</option>
              <option value={LAST_1_YEAR}>Last 1 year</option>
              <option value={LAST_2_YEARS}>Last 2 years</option>
            </select>
          </div>
          <div style={{ height: '400px', paddingTop: 5 }}>
            <VisualiseResults id={model.get('_id')} />
          </div>
        </div>
      </div>
    );
  }
}

export default connect((state, ownProps) => ({
  hasMore: ownProps.hasMore,
  isLoading: ownProps.isLoading
}), { updateModel })(StatementsForm);
