import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import tooltipFactory from 'react-toolbox/lib/tooltip';
import MaterialLink from 'react-toolbox/lib/link';
import styled from 'styled-components';

const ButtonWrapper = styled.div`
  display: flex;
  align-items: center;

  a {
    padding: 4px;
    color: #ccc;

    &:hover {
      color: #F5AB35;
    }
  }
`;

const LinkWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  height: 36px;
  width: 100%;
  padding: 0 8px;

  &:hover {
    text-decoration: none;
    background: #eee;
  }
`;

const TextWrapper = styled.div`
  flex-grow: 1;
  display: flex;
  align-content: center;
  min-width: 0;

  abbr {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  a {
    text-decoration: none;
    min-width: 0;
    color: #000;
  }
`;

const tooltipClassName = 'm-tooltip';

const StyledTooltipLink = styled(tooltipFactory(MaterialLink))`
  .${tooltipClassName} {
    word-break: break-all;
  }
`;

class OptionListItem extends Component {
  static propTypes = {
    label: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.string,
    ]),
    href: PropTypes.string,
    target: PropTypes.string,
    rel: PropTypes.string,
    icon: PropTypes.node,
    data: PropTypes.oneOfType([
      PropTypes.instanceOf(Map),
      PropTypes.string
    ]),
    tooltip: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.string,
    ]),
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
    if (this.state.confirmDelete) {
      return <MaterialLink label="Are you sure?" />;
    }

    const { label, tooltip, target, rel, href, icon } = this.props;
    const linkProps = {
      label,
      target,
      rel,
      href,
      icon
    };

    if (tooltip) {
      return (
        <StyledTooltipLink
          className={tooltipClassName}
          {...linkProps}
          tooltip={tooltip} />
      );
    }

    return <MaterialLink {...linkProps} />;
  };

  renderButtons = () => {
    if (this.state.confirmDelete) {
      return (
        <ButtonWrapper>
          <a onClick={this.onConfirmDelete}>
            <i className="ion-checkmark-round" />
          </a>
          <a onClick={this.onCancelDelete}>
            <i className="ion-close-round" />
          </a>
        </ButtonWrapper>
      );
    }

    return (
      <ButtonWrapper>
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
      </ButtonWrapper>
    );
  }

  render = () => (
    <LinkWrapper>
      <TextWrapper onClick={this.onClick}>
        {this.renderText()}
      </TextWrapper>
      {this.renderButtons()}
    </LinkWrapper>
  );
}

export default OptionListItem;
