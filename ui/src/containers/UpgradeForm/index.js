import React, { Component } from 'react';
import Checkbox from 'ui/components/Material/Checkbox';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { connect } from 'react-redux';

class UpgradeForm extends Component {
  static propTypes = {
    model: PropTypes.instanceOf(Map),
  }

  static defaultProps = {
    model: new Map()
  }

  constructor(props) {
    super(props);

    this.state = {
      checked: false,
      firstName: '',
      lastName: '',
      email: '',
      mailingList: false,
      privacyPolicy: false
    };
  }

  onChangeAttr = (event) => {
    const name = event.id;

    this.setState({
      [name]: event.value
    });
  }

  onChangeBooleanSetting = (event) => {
    event.checked ? this.setState({ checked: false }) : this.setState({ checked: true });
  };

  handleSubmit = () => {
    // email hello@ht2labs.com?subject=
  }

  render = () => (
    <form onSubmit={this.handleSubmit}>
      <div className="form-group">
        <label htmlFor="firstName">First name</label>
        <input
          id="firstName"
          className="form-control"
          placeholder="Your first name"
          value={this.state.value}
          onChange={this.onChangeAttr.bind(null, 'firstName')} />
      </div>
      <div className="form-group">
        <label htmlFor="lastName">Last name</label>
        <input
          id="lastName"
          className="form-control"
          placeholder="Your last name"
          value={this.state.value}
          onChange={this.onChangeAttr.bind(null, 'lastName')} />
      </div>
      <div className="form-group">
        <label htmlFor="emailInput">Email</label>
        <input
          id="emailInput"
          className="form-control"
          placeholder="Your email address"
          value={this.state.value}
          onChange={this.onChangeAttr.bind(this)} />
      </div>
      <div className="form-group">
        <Checkbox
          id="mailingList"
          label="Please subscribe me to the 'Friends of HT2 Labs' Mailing List"
          checked={false}
          onChange={this.onChangeBooleanSetting.bind(this)} />
      </div>
      <div className="form-group">
        <Checkbox
          id="privacyPolicy"
          label="I consent to storage of my data according to the Privacy Policy"
          checked
          onChange={this.onChangeBooleanSetting.bind(
            null,
            true
            )} />
      </div>
      <div className="form-group">
        <button
          className="btn btn-primary btn-sm"
          onClick={this.handleSubmit}>
          Submit
          </button>
      </div>
    </form>
  )
}

export default connect(() => ({}), {})(UpgradeForm);
