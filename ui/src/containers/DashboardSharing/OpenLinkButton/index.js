/* eslint-disable react/jsx-indent */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

class OpenLinkButton extends Component {
  static propTypes = {
    className: PropTypes.string,
    openLink: PropTypes.func,
    white: PropTypes.bool,
    small: PropTypes.bool,
    disabled: PropTypes.bool,
  }

  static defaultProps = {
    className: '',
    disabled: false,
  }

  onClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.props.openLink();
  }

  render = () => {
    const { className } = this.props;

    const classes = classNames({
      [className]: true,
      btn: true,
      'btn-sm': !this.props.small,
      'btn-xs': this.props.small,
      'btn-inverse': !this.props.white && !this.props.small,
      'flat-white flat-btn': this.props.white,
      'btn-default': this.props.small || this.props.white
    });
    const width = this.props.small ? '22.5px' : '33px';


    return (
      <button className={classes} title="View dashboard in new tab" onClick={this.onClick.bind(null)} style={{ width }} disabled={this.props.disabled}>
        <i className="icon ion-android-open" />
      </button>
    );
  }
}

export default OpenLinkButton;
