/* eslint-disable react/jsx-indent */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import DeleteConfirm from 'ui/containers/DeleteConfirm';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import styles from './styles.css';

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
      this.props.tab ? (
        <span title="Delete" className={`top right btn-xs ${styles.closeTab}`} onClick={this.openModal.bind(null)} >
          <i className={`icon ion-close-round ${styles.closeIcon}`} />
          { modal }
        </span>
      ) : (
        <button className={classes} title="Delete" onClick={this.openModal.bind(null)} style={{ width }} disabled={this.props.disabled}>
          <i className="icon ion-trash-b" />
          { modal }
        </button>
      )
    );
  }
}

export default withStyles(styles)(DeleteButton);
