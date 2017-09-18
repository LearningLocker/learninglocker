import onClickOutside from 'react-onclickoutside';
import React, { Component, PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import classNames from 'classnames';
import { compose } from 'recompose';
import styles from './dropdownmenu.css';

class DropDownMenu extends Component {
  static propTypes = {
    button: PropTypes.node,
    children: PropTypes.node
  }

  constructor(props) {
    super(props);
    this.state = {
      isOpen: false
    };
  }

  handleClickOutside = () => {
    this.setState({
      isOpen: false
    });
  }

  onClick = () => {
    this.setState({
      isOpen: true
    });
  }

  render = () => (
    <div
      className={classNames({
        'btn-group': true,
        open: this.state.isOpen,
        [styles.menu]: true
      })}>
      <span onClick={this.onClick} >
        {this.props.button}
      </span>
      {this.state.isOpen &&
        <ul className="dropdown-menu">
          {React.Children.map(this.props.children, child => (
            <li>{child}</li>
        ))}
        </ul>
      }
    </div>
  );
}

export default compose(
  withStyles(styles),
  onClickOutside
)(DropDownMenu);

