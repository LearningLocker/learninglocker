import React, { Component, PropTypes } from 'react';
import { List } from 'immutable';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import styles from './validationlist.css';

class ValidationList extends Component {
  static propTypes = {
    errors: PropTypes.instanceOf(List)
  }

  static defaultProps = {
    errors: new List()
  };

  render = () => {
    const { errors } = this.props;

    return (
      <div className={styles.validationlist}>
        <ul>
          { errors.map((error, index) =>
            <li key={index}>{error}</li>
            ).valueSeq()
          }
        </ul>
      </div>
    );
  }
}

export default withStyles(styles)(ValidationList);
