import React from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { TEMPLATE_STAGE_COMPLETED } from 'lib/constants/visualise';
import VisualiseResults from 'ui/containers/VisualiseResults';

class TemplateIntermediateStage extends React.PureComponent {
  static propTypes = {
    settings: PropTypes.instanceOf(Map).isRequired,
    model: PropTypes.instanceOf(Map),
    updateModel: PropTypes.func.isRequired,
  }

  onClickCreate = () => {
    const { settings, model, updateModel } = this.props;

    updateModel({
      path: ['templateStage'],
      value: TEMPLATE_STAGE_COMPLETED,
    });

    if (!model.has('description')) {
      updateModel({
        path: ['description'],
        value: settings.get('title'),
      });
    }
  };

  onChangeName = e => this.props.updateModel({
    path: ['description'],
    value: e.target.value,
  });

  render = () => {
    const { settings, model } = this.props;
    return (
      <div className="row">
        <div className="col-md-6 left-border">
          <div className="form-group">
            <label htmlFor="new-template-name-input">Name</label>
            <input
              id="new-template-name-input"
              className="form-control"
              placeholder={settings.get('title')}
              value={model.get('description')}
              onChange={this.onChangeName} />
          </div>
        </div>

        <div className="col-md-6">
          <div style={{ height: '400px' }}>
            <VisualiseResults id={model.get('_id')} />
          </div>

          <div>
            <span className="pull-right open_panel_btn">
              <button
                className="btn btn-primary btn-sm"
                onClick={this.onClickCreate}>
                <i className="ion ion-checkmark" />
              </button>
            </span>
          </div>
        </div>
      </div>
    );
  }
}

export default TemplateIntermediateStage;
