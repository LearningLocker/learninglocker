import React, { Component, PropTypes } from 'react';
import { Map } from 'immutable';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import styles from './statementform.css';

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

export default withStyles(styles)(StatementForm);
