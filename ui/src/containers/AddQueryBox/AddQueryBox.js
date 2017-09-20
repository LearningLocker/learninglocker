import React, { Component, PropTypes } from 'react';

export default class AddQueryBox extends Component {
  static propTypes = {
    onSubmit: PropTypes.func,
  }

  static defaultProps = {
    onSubmit: () => null,
    onCancel: () => null
  }

  state = {
    value: ''
  }

  onSubmit = (e) => {
    e.preventDefault();
    this.props.onSubmit(this.state.value);
  }

  render = () => {
    const { value } = this.state;

    return (
      <div className="form-group" style={{ marginBottom: 0 }} ref={(c) => { this.nameInputWrapper = c; }}>
        <form
          ref={(c) => { this.nameInputForm = c; }}
          onSubmit={this.addNewQuery}>
          <input
            ref={(c) => { this.nameInput = c; }}
            placeholder="Enter a name for your query"
            className="form-control"
            value={value}
            onChange={this.onChange}
            style={{ height: '24px' }} />
        </form>
      </div>
    );
  }
}
