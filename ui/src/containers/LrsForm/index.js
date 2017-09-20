import React, { Component, PropTypes } from 'react';
import { Map } from 'immutable';
import { updateModel } from 'ui/redux/modules/models';
import { connect } from 'react-redux';

const schema = 'lrs';

class LRSForm extends Component {
  static propTypes = {
    model: PropTypes.instanceOf(Map),
    updateModel: PropTypes.func
  }

  static defaultProps = {
    model: new Map()
  }

  onChangeAttr = (attr, e) => {
    this.props.updateModel({
      schema,
      id: this.props.model.get('_id'),
      path: attr,
      value: e.target.value
    });
  }

  render = () => {
    const { model } = this.props;
    return (
      <div className="row">
        <div className="col-md-12" >
          <div className="form-group">
            <label htmlFor={`${model.get('_id')}nameInput`}>Title</label>
            <input
              id={`${model.get('_id')}nameInput`}
              className="form-control"
              placeholder="A name for this LRS"
              value={model.get('title')}
              onChange={this.onChangeAttr.bind(null, 'title')} />
          </div>
          <div className="form-group">
            <label htmlFor={`${model.get('_id')}descriptionInput`}>Description</label>
            <input
              id={`${model.get('_id')}descriptionInput`}
              className="form-control"
              placeholder="A short description of this LRS' purpose"
              value={model.get('description')}
              onChange={this.onChangeAttr.bind(null, 'description')} />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(() => ({}), { updateModel })(LRSForm);
