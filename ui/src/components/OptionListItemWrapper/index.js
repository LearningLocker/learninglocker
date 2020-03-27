import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { noop, identity } from 'lodash';
import styled from 'styled-components';

const Wrapper = styled.div`
  cursor: default;
  white-space: nowrap;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  height: 36px;
  ${props => props.highlighted && 'background: #eee;' || ''}
`;

class OptionListItemWrapper extends Component {
  static propTypes = {
    highlighted: PropTypes.bool,
    index: PropTypes.any, // eslint-disable-line react/forbid-prop-types
    style: PropTypes.object,
    handleSelect: PropTypes.func,
    onClick: PropTypes.func,
    value: PropTypes.any, // eslint-disable-line react/forbid-prop-types
    children: PropTypes.node
  }

  static defaultProps = {
    handleSelect: noop,
    handleClick: noop,
    highlighted: false,
    index: 0,
    parse: identity,
    parseTooltip: identity,
  }

  shouldComponentUpdate = nextProps => !(
    this.props.children === nextProps.children &&
    this.props.highlighted === nextProps.highlighted &&
    this.props.index === nextProps.index &&
    this.props.value === nextProps.value
  );

  onMouseEnter = () => {
    this.props.handleSelect(this.props.index);
  }
  onClick = () => {
    this.props.onClick(this.props.value);
  }

  render() {
    const { style, highlighted } = this.props;

    return (
      <Wrapper
        highlighted={highlighted}
        style={style}
        onClick={this.onClick}
        onMouseEnter={this.onMouseEnter} >
        {this.props.children}
      </Wrapper>
    );
  }
}

export default OptionListItemWrapper;
