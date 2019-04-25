import React, { Component, PropTypes } from 'react';
import { Map } from 'immutable';
import { connect } from 'react-redux';
//import { VISUALISE_AXES_PREFIX } from 'lib/constants/visualise';
import { updateModel } from 'ui/redux/modules/models';
import CourseEditor from './AxesEditor/CourseEditor';
import BaseAxesEditor from './AxesEditor/BaseAxesEditor';

export class CourseEditorDropdown extends BaseAxesEditor {
  static propTypes = {
    model: PropTypes.instanceOf(Map),
    updateModel: PropTypes.func
  };

  //shouldComponentUpdate = (nextProps) => {
    //const prevAxes = this.props.model.filter((_, key) => key.startsWith(VISUALISE_AXES_PREFIX));
    //const nextAxes = nextProps.model.filter((_, key) => key.startsWith(VISUALISE_AXES_PREFIX));

    //return !prevAxes.equals(nextAxes);
  //};

  render = () => {
    //console.log('COURSE ED LOADING', this.props)
    return (
    <div className="form-group">
      <label htmlFor="toggleInput" className="clearfix">I RENDER YO</label>
      <div className="form-group">
        <CourseEditor
          type={this.props.model.get('type')}
          value={this.getAxesValue('value')}
          operator={this.getAxesValue('operator')}
          changeValue={this.changeAxes.bind(this, 'value')}
          changeOperator={this.changeAxes.bind(this, 'operator')} 
          />
      </div>
    </div>
  )
};
}

export default connect(() => ({}), { updateModel })(CourseEditorDropdown);
