import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Set } from 'immutable';
import styled from 'styled-components';
import Option from '../Option/Option';

const StyledDropdown = styled.div`
  background-color: white;
  border: 1px solid #ccc;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06);
  box-sizing: border-box;
  margin-top: -1px;
  max-height: 200px;
  overflow-y: auto;
  position: absolute;
  top: 100%;
  width: 100%;
  z-index: 1000;

  &:focus {
    outline: none;
  }
`;

class Dropdown extends Component {
  static propTypes = {
    children: PropTypes.instanceOf(Set),
    onSelect: PropTypes.func,
  }

  state = {
    highlighted: null,
  }

  componentDidMount = () => {
    this.dropdown.focus();
  }

  shouldComponentUpdate = (nextProps, nextState) => !(
    this.props.children.equals(nextProps.children) &&
    this.state.highlighted === nextState.highlighted
  );

  getChildKeys = () => this.props.children.keySeq();

  equalsHighlighted = key => (key === this.state.highlighted);

  highlightChild = key => this.setState({ highlighted: key });

  highlightNextChild = () => {
    const keys = this.getChildKeys();
    let nextKeys;

    if (this.state.highlighted === null) {
      nextKeys = keys;
    } else {
      nextKeys = keys
        .skipUntil(this.equalsHighlighted)
        .skipWhile(this.equalsHighlighted);
    }

    return this.highlightChild(nextKeys.first());
  }

  highlightPreviousChild = () => {
    const keys = this.getChildKeys();
    let prevKeys;

    if (this.state.highlighted === null) {
      prevKeys = keys;
    } else {
      prevKeys = keys.takeUntil(this.equalsHighlighted);
    }

    return this.highlightChild(prevKeys.last());
  }

  selectChild = (key) => {
    this.props.onSelect(key);
  }

  handleKeyDown = (event) => {
    const UP = 38;
    const DOWN = 40;
    switch (event.keyCode) {
      case UP:
        this.highlightPreviousChild();
        return event.preventDefault();
      case DOWN:
        this.highlightNextChild();
        return event.preventDefault();
      default: break;
    }
  }

  renderChild = (child, key) => (
    <Option
      key={key}
      highlighted={this.state.highlighted === key}
      onSelect={this.selectChild.bind(this, key)}
      onHighlight={this.highlightChild.bind(this, key)}>
      {child}
    </Option>
  );

  render = () => (
    <StyledDropdown
      onKeyDown={this.handleKeyDown}
      ref={(ref) => { this.dropdown = ref; }}
      tabIndex={0}>
      {this.props.children.map(this.renderChild)}
    </StyledDropdown>
  );
}

export default Dropdown;
