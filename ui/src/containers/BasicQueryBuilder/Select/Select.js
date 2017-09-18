import React, { Component, PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import classNames from 'classnames';
import Dropdown from '../Dropdown/Dropdown';
import styles from './styles.css';

class Select extends Component {
  static propTypes = {
    value: PropTypes.string,
    children: PropTypes.node,
    onSelect: PropTypes.func,
  }

  state = {
    focused: false,
  }

  focus = () => {
    this.setState({ focused: true });
  }

  blur = () => {
    this.setState({ focused: false });
  }

  render = () => {
    const buttonStyles = classNames(styles.content, 'btn btn-default btn-xs');
    return (
      <div
        className={styles.select}
        onFocus={this.focus}
        onBlur={this.blur}
        tabIndex={0}>
        <div className={buttonStyles}>
          <div className={styles.value}>{this.props.value}</div>
          <div className={styles.indicator}>
            {
              this.state.focused ?
              (<div className="ion-arrow-down-b" />) :
              (<div className="ion-arrow-up-b" />)
            }
          </div>
        </div>
        {this.state.focused &&
          <Dropdown onSelect={this.props.onSelect}>
            {this.props.children}
          </Dropdown>
        }
      </div>
    );
  }
}

export default withStyles(styles)(Select);
