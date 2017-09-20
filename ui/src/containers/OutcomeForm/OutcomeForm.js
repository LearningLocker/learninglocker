import React, { Component, PropTypes } from 'react';
import { Map } from 'immutable';
import Switch from 'ui/components/Material/Switch';

export default class OutcomeForm extends Component {
  static propTypes = {
    outcome: PropTypes.instanceOf(Map),
    update: PropTypes.func
  }

  static defaultProps = {
    outcome: new Map()
  }

  onChangeAttr = (attr, e) => {
    this.props.update(attr, e.target.value);
  }

  onActiveToggle = (checked) => {
    this.props.update('isActive', checked);
  }

  render = () => {
    const { outcome } = this.props;
    let isActive = outcome.get('isActive', false);
    let isActiveDisabled = false;
    const callbackStr = outcome.get('callback', '');

    if (callbackStr.length === 0) {
      isActiveDisabled = true;
      isActive = false;
    }

    return (
      <div>
        <div className="form-group">
          <Switch
            label="Active?"
            onChange={this.onActiveToggle}
            checked={isActive}
            disabled={isActiveDisabled} />
        </div>
        <div className="form-group">
          <label htmlFor={`${outcome.get('_id')}descriptionInput`}>Description</label>
          <input
            id={`${outcome.get('_id')}descriptionInput`}
            className="form-control"
            placeholder="A short description"
            value={outcome.get('description')}
            onChange={this.onChangeAttr.bind(null, 'description')} />
        </div>
        <div className="form-group">
          <label htmlFor={`${outcome.get('_id')}callbackInput`}>Callback</label>
          <input
            id={`${outcome.get('_id')}callbackInput`}
            disabled={isActive}
            className="form-control"
            placeholder="Callback url"
            value={outcome.get('callback')}
            onChange={this.onChangeAttr.bind(null, 'callback')} />
        </div>
      </div>
    );
  }
}
