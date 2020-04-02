import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const StyledOption = styled.div`
  padding: 4px 4px;
  cursor: pointer;
  ${props => props.isHighlighted && 'background-color: #d4d4d4;' || ''}

  &:focus {
    outline: 0;
  }
`;

class Option extends Component {
  static propTypes = {
    children: PropTypes.node,
    highlighted: PropTypes.bool,
    onSelect: PropTypes.func,
    onHighlight: PropTypes.func,
  }

  componentDidMount = () => {
    this.focus();
  }

  shouldComponentUpdate = nextProps => !(
    this.props.highlighted === nextProps.highlighted &&
    this.props.children === nextProps.children
  );

  componentDidUpdate = () => {
    this.focus();
  }

  handleKeyDown = (event) => {
    const ENTER = 13;
    switch (event.keyCode) {
      case ENTER:
        this.props.onSelect();
        return event.preventDefault();
      default: break;
    }
  }

  focus = () => {
    if (this.props.highlighted) {
      this.option.focus();
    }
  }

  render = () => (
    <StyledOption
      isHighlighted={this.props.highlighted}
      onClick={this.props.onSelect}
      onMouseOver={this.props.onHighlight}
      onKeyDown={this.handleKeyDown}
      tabIndex={0}
      ref={
        (ref) => {
          this.option = ref;
        }
      }>
      {this.props.children}
    </StyledOption>
  );
}

export default Option;
