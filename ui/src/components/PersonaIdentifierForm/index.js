import React, { Component, PropTypes } from 'react';

export default class PersonaIdentifierForm extends Component {

  static propTypes = {
    newKey: PropTypes.string,
    newValue: PropTypes.string,
    onKeyChange: PropTypes.func,
    onValueChange: PropTypes.func,
  }

  handleKeyChange = (e) => {
    this.props.onKeyChange(e.target.value);
  }

  handleValueChange = (e) => {
    this.props.onValueChange(e.target.value);
  }

  render = () => (
    <form>
      <div className="input-group">
        <span
          className="input-group-addon"
          id="basic-addon3">
          {'Key'}
        </span>
        <input
          type="text"
          className="form-control"
          id="basic-url"
          aria-describedby="basic-addon3"
          placeholder="statement.actor.mbox"
          onChange={this.handleKeyChange}
          value={this.props.newKey} />
      </div>
      <div className="input-group">
        <span
          className="input-group-addon"
          id="basic-addon3">
          {'Value'}
        </span>
        <input
          type="text"
          className="form-control"
          id="basic-url"
          aria-describedby="basic-addon3"
          placeholder="mailto:test@example.com"
          onChange={this.handleValueChange}
          value={this.props.newValue} />
      </div>
    </form>
  );
}
