import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { updateModel } from 'ui/redux/modules/models';
import VisualiseResults from 'ui/containers/VisualiseResults';
import SourceResults from 'ui/containers/VisualiseResults/SourceResults';
import Editor from './Editor';
import PreviewPeriodPicker from './PreviewPeriodPicker';

class StatementsForm extends Component {
  static propTypes = {
    model: PropTypes.instanceOf(Map),
    orgTimezone: PropTypes.string.isRequired,
    updateModel: PropTypes.func,
  }

  static defaultProps = {
    model: new Map(),
  }

  shouldComponentUpdate = nextProps => !(
    this.props.model.equals(nextProps.model)
  )

  onChangePreviewPeriod = previewPeriod => this.props.updateModel({
    schema: 'visualisation',
    id: this.props.model.get('_id'),
    path: 'previewPeriod',
    value: previewPeriod,
  })

  render = () => (
    <div className="row">
      <div className="col-md-6 left-border">
        <Editor
          model={this.props.model}
          orgTimezone={this.props.orgTimezone} />
      </div>

      <div className="col-md-6">
        <div className="form-group form-inline" style={{ textAlign: 'right' }}>
          <PreviewPeriodPicker
            visualisation={this.props.model}
            onChange={this.onChangePreviewPeriod} />
        </div>

        <div style={{ height: '400px', paddingTop: 5 }}>
          {
            this.props.model.get('sourceView') ?
              <SourceResults id={this.props.model.get('_id')} /> :
              <VisualiseResults id={this.props.model.get('_id')} />
          }
        </div>
      </div>
    </div>
    )
}

export default connect(
  () => {},
  { updateModel }
)(StatementsForm);
