import React, { Component, PropTypes } from 'react';
import { Map } from 'immutable';
import tooltipFactory from 'react-toolbox/lib/tooltip';
import MaterialLink from 'react-toolbox/lib/link';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { omitBy, isFunction } from 'lodash';
import styles from './styles.css';

const TooltipLink = tooltipFactory(MaterialLink);

class OptionListItem extends Component {
  static propTypes = {
    label: PropTypes.string,
    href: PropTypes.string,
    target: PropTypes.string,
    rel: PropTypes.string,
    icon: PropTypes.node,
    data: PropTypes.oneOfType([
      PropTypes.instanceOf(Map),
      PropTypes.string
    ]),
    tooltip: PropTypes.string,
    onClick: PropTypes.func,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
  }

  state = {
    confirmDelete: false
  }

  onClick = (e) => {
    if (this.props.onClick) {
      this.props.onClick(this.props.data, e);
    }
  }

  onEdit = (e) => {
    e.stopPropagation();
    this.props.onEdit(this.props.data);
  }

  onDelete = (e) => {
    e.stopPropagation();
    this.setState({ confirmDelete: true });
  }

  onConfirmDelete = (e) => {
    e.stopPropagation();
    this.setState({ confirmDelete: false });
    this.props.onDelete(this.props.data);
  }

  onCancelDelete = (e) => {
    e.stopPropagation();
    this.setState({ confirmDelete: false });
  }

  renderText = () => {
    if (this.state.confirmDelete) return <MaterialLink label="Are you sure?" />;

    const { label, tooltip, target, rel, href, icon } = this.props;
    const linkProps = {
      label,
      theme: omitBy(styles, isFunction),
      target,
      rel,
      href,
      icon
    };

    if (tooltip) return <TooltipLink {...linkProps} tooltip={tooltip} />;
    return <MaterialLink {...linkProps} />;
  }

  renderButtons = () => {
    if (this.state.confirmDelete) {
      return (
        <div className={styles.buttonWrapper}>
          <a onClick={this.onConfirmDelete}>
            <i className="ion-checkmark-round" />
          </a>
          <a onClick={this.onCancelDelete}>
            <i className="ion-close-round" />
          </a>
        </div>
      );
    }

    return (
      <div className={styles.buttonWrapper}>
        { this.props.onEdit &&
          <a onClick={this.onEdit} >
            <i className="ion-edit" />
          </a>
        }
        { this.props.onDelete &&
          <a onClick={this.onDelete} >
            <i className="ion-trash-b" />
          </a>
        }
      </div>
    );
  }

  render = () => (
    <div className={styles.linkWrapper}>
      <div className={styles.textWrapper} onClick={this.onClick}>
        {this.renderText()}
      </div>
      {this.renderButtons()}
    </div>
  );
}

export default withStyles(styles)(OptionListItem);
