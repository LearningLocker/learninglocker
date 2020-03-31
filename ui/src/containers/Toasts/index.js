import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import Portal from 'react-portal';
import styled from 'styled-components';
import {
  toastSelector,
  toastFinish,
} from 'ui/redux/modules/toasts';

const Toast = styled.div`
  background-color: #d9534f;
  border-color: #d43f3a;
  color: white;
  padding: 10px;
  margin: 10px;
  cursor: pointer;
`;

const ToastsContainer = styled.div`
  top: 56px;
  width: 20%;
  left: 40%;
  position: fixed;
  z-index: 301;
  opacity: 0.7;
  text-align: center;
`;

class Toasts extends Component {

  static propTypes = {
    toasts: PropTypes.instanceOf(Map),
    toastFinish: PropTypes.func,
  };

  handleClose = (key) => {
    this.props.toastFinish([key]);
  };

  renderToast = (toast, key) => (
    <Toast
      key={key}
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
    </Toast>
  );

  render() {
    const { toasts } = this.props;
    return (
      <Portal isOpened={toasts.count() !== 0}>
        <ToastsContainer>
          {toasts.map(this.renderToast).valueSeq()}
        </ToastsContainer>
      </Portal>
    );
  }
}

export default connect(
  state => ({ toasts: toastSelector(state) }),
  { toastFinish }
)(Toasts);
