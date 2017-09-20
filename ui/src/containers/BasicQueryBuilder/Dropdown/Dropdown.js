import React, { Component, PropTypes } from 'react';
import { Set } from 'immutable';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import Option from '../Option/Option';
import styles from './styles.css';

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
    <div
      onKeyDown={this.handleKeyDown}
      className={styles.dropdown}
      ref={(ref) => { this.dropdown = ref; }}
      tabIndex={0}>
      {this.props.children.map(this.renderChild)}
    </div>
  );
}

export default withStyles(styles)(Dropdown);

