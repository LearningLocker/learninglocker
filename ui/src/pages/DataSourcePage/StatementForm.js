import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import decodeDot from 'lib/helpers/decodeDot';

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
        {decodeDot(JSON.stringify(model.toJS(), null, 2))}
      </pre>
    );
  }
}

export default StatementForm;
