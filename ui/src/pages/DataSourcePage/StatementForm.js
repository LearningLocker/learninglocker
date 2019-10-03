import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';

class StatementForm extends Component {

  static propTypes = {
    model: PropTypes.instanceOf(Map),
  }

  static defaultProps = {
    model: new Map(),
  }

  render = () => {
    const { model } = this.props;

    return (
      <pre>
        {JSON.stringify(model.toJS(), null, 2)}
      </pre>
    );
  }
}

export default StatementForm;
