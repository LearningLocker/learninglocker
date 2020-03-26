/* eslint-disable react/jsx-indent */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import DeleteConfirm from 'ui/containers/DeleteConfirm';
import styled from 'styled-components';

const CloseIcon = styled.i`
  margin-right: 0;
  padding-top: 1px;
  padding-bottom: 1px;
`;

const CloseTab = styled.span`
  margin-left: 12px;

  &:hover {
    background-color: #494444;
    color: #fff;
    border-radius: 50%;
    border: 0 solid #494444;
  }
`;

class DeleteButton extends Component {
  static propTypes = {
    schema: PropTypes.string,
    className: PropTypes.string,
    id: PropTypes.string,
    tab: PropTypes.bool,
    white: PropTypes.bool,
    small: PropTypes.bool,
    disabled: PropTypes.bool,
    onDeletedModel: PropTypes.func,
    renderMessage: PropTypes.func,
    onDelete: PropTypes.func,
  }

  static defaultProps = {
    onDeletedModel: () => null,
    className: '',
    disabled: false
  }

  state = {
    openModal: null,
  }

  openModal = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      openModal: true
    });
  }

  closeModal = () => {
    this.setState({
      openModal: null
    });
  }

  render = () => {
    const { className } = this.props;
    const { openModal } = this.state;

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

    const popupProps = {
      schema: this.props.schema,
      id: this.props.id,
      onClickClose: this.closeModal
    };

    const modal = (
      <DeleteConfirm
        renderMessage={this.props.renderMessage}
        isOpened={openModal === true}
        onDeletedModel={this.props.onDeletedModel}
        onDelete={this.props.onDelete}
        {...popupProps} />
    );

    return (
      this.props.tab
        ? (
          <CloseTab
            title="Delete"
            className={'top right btn-xs'}
            onClick={this.openModal.bind(null)}>
            <CloseIcon className={'icon ion-close-round'} />
            {modal}
          </CloseTab>
        )
        : (
          <button
            className={classes}
            title="Delete"
            onClick={this.openModal.bind(null)}
            style={{ width }}
            disabled={this.props.disabled}>
            <i className="icon ion-trash-b" />
            {modal}
          </button>
        )
    );
  }
}

export default DeleteButton;
