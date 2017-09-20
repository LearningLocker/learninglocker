import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { Map } from 'immutable';
import Portal from 'react-portal';
import {
  toastSelector,
  toastFinish,
} from 'ui/redux/modules/toasts';
import styles from './toasts.css';

class Toasts extends Component {

  static propTypes = {
    toasts: PropTypes.instanceOf(Map),
    toastFinish: PropTypes.func,
  }

  handleClose = (key) => {
    this.props.toastFinish([key]);
  }

  renderToast = (toast, key) => (
    <div
      key={key}
      className={styles.toast}
      onClick={this.handleClose.bind(null, key)}>
      <button
        type="button"
        className="close"
        aria-label="Close"
        onClick={this.handleClose.bind(null, key)}>
        <span aria-hidden="true">&times;</span>
      </button>
      <span>
        {toast.get('message')}
      </span>
    </div>
    )

  render() {
    const { toasts } = this.props;
    return (
      <Portal isOpened={toasts.count() !== 0}>
        <div className={styles.toasts}>
          {toasts.map(this.renderToast).valueSeq()}
        </div>
      </Portal>
    );
  }
}

export default withStyles(styles)(connect(state => ({
  toasts: toastSelector(state)
}), { toastFinish })(Toasts));
