import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import styles from './styles.css';

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

  render = () => {
    const classes = classNames(styles.option, {
      [styles.highlightedOption]: this.props.highlighted
    });

    return (
      <div
        className={classes}
        onClick={this.props.onSelect}
        onMouseOver={this.props.onHighlight}
        onKeyDown={this.handleKeyDown}
        tabIndex={0}
        ref={(ref) => { this.option = ref; }}>
        {this.props.children}
      </div>
    );
  }
}

export default withStyles(styles)(Option);
