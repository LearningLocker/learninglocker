import React, { Component, PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import styles from './styles.css';

class AddModelPrompt extends Component {
  static propTypes = {
    onAdd: PropTypes.func,
    message: PropTypes.string,
  }

  static defaultProps = {
    onAdd: () => {}
  }

  render = () => {
    const { message } = this.props;

    return (
      <h4>
        { message }
        <a className={styles.addNew} onClick={this.props.onAdd}><i className="ion ion-plus-circled" /></a>
      </h4>
    );
  }
}

export default withStyles(styles)(AddModelPrompt);
