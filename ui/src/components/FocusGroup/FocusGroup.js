import React, { Component, PropTypes } from 'react';
import onClickOutside from 'react-onclickoutside';

class FocusGroup extends Component {
  static propTypes = {
    className: PropTypes.string,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    hasFocus: PropTypes.bool,
    children: PropTypes.node,
  }
  handleClickOutside = () => {
    if (this.props.hasFocus) {
      this.props.onBlur();
    }
  }

  handleClick = () => {
    if (!this.props.hasFocus) {
      this.props.onFocus();
    }
  }

  render = () => (
    <div
      ref={(wrapper) => { this.wrapper = wrapper; }}
      className={this.props.className}
      onClick={this.handleClick}>
      {this.props.children}
    </div>
  )
}
export default onClickOutside(FocusGroup);
