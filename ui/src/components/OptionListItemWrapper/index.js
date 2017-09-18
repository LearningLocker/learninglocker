import React, { Component, PropTypes } from 'react';
import { noop, identity } from 'lodash';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import classNames from 'classnames';
import styles from './styles.css';

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
    const { style } = this.props;
    const wrapperClasses = classNames({
      [styles.wrapper]: true,
      [styles.highlighted]: this.props.highlighted
    });

    return (
      <div
        style={style}
        onClick={this.onClick}
        onMouseEnter={this.onMouseEnter}
        className={wrapperClasses} >
        {this.props.children}
      </div>
    );
  }
}

export default withStyles(styles)(OptionListItemWrapper);
