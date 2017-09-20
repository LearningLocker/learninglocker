import React, { Component, PropTypes } from 'react';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { updateModel } from 'ui/redux/modules/models';

const schema = 'organisation';

class OrgForm extends Component {
  static propTypes = {
    model: PropTypes.instanceOf(Map),
    updateModel: PropTypes.func,
  }

  static defaultProps = {
    model: new Map(),
  }

  onChangeAttr = (attr, e) => this.props.updateModel({
    schema,
    id: this.props.model.get('_id'),
    path: attr,
    value: e.target.value
  });

  render = () => {
    const { model } = this.props;

    return (
      <div className="row">
        <div className="col-md-12" >
          <div className="form-group">
            <label htmlFor="lrsTitleInput">Name</label>
            <input
              className="form-control"
              placeholder="Name for this organisation"
              value={model.get('name')}
              onChange={this.onChangeAttr.bind(null, 'name')} />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(() => ({}), { updateModel })(OrgForm);
