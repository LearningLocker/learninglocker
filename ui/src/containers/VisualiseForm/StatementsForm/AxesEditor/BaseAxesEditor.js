import { Component } from 'react';
import { VISUALISE_AXES_PREFIX } from 'lib/constants/visualise';
import { is } from 'immutable';

export default class BaseAxesEditor extends Component {
  shouldComponentUpdate = (nextProps) => {
    const prevAxes = this.props.model.filter((item, key) => key.startsWith(VISUALISE_AXES_PREFIX));
    const nextAxes = nextProps.model.filter((item, key) => key.startsWith(VISUALISE_AXES_PREFIX));

    return !prevAxes.equals(nextAxes);
  };

  changeAxes = (key, value) => {
    const { model } = this.props;
    const modelId = model.get('_id');

    if (is(model.get(VISUALISE_AXES_PREFIX + key), value)) {
      // Don't update if new value is same as old value
      return;
    }
    this.props.updateModel({
      schema: 'visualisation',
      id: modelId,
      path: VISUALISE_AXES_PREFIX + key,
      value
    });
  };

  getAxesValue = (key, notSetValue) => {
    const value = this.props.model.get(VISUALISE_AXES_PREFIX + key, notSetValue);
    return value;
  };

  handleAxesChange = (key, event) => {
    this.changeAxes(key, event.target.value);
  };
}
