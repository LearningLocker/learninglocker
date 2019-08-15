import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { Map } from 'immutable';
import UpgradeForm from '../UpgradeForm';

class Demo extends Component {
  static propTypes = {
    model: PropTypes.instanceOf(Map)
  };
  static defaultProps = {
    model: new Map()
  }

  render = () => (
    <div>
      <header id="topbar">
        <div className="heading heading-light">
          Get in touch to find out how to access this app
        </div>
      </header>
      <UpgradeForm model={this.props.model} />
    </div>
  )
}

export default compose(Demo);
