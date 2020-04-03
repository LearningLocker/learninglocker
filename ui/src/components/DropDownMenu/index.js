import onClickOutside from 'react-onclickoutside';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { compose } from 'recompose';
import styled from 'styled-components';

const Menu = styled.div`
  & ul > div {
    display: block;
    padding: 3px 20px;
    clear: both;
    font-weight: normal;
    line-height: 1.42857;
    color: #333333;
    white-space: nowrap;
  }
`;

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
    const openState = !this.state.isOpen;
    this.setState({
      isOpen: openState
    });
  }

  render = () => (
    <Menu
      className={classNames({
        'btn-group': true,
        open: this.state.isOpen,
      })}>
      <span onClick={this.onClick} >
        {this.props.button}
      </span>
      {this.state.isOpen &&
        <ul className={`dropdown-menu ${this.props.customClass}`}>
          {React.Children.map(this.props.children, (child, index) => (
            <li key={index}>{child}</li>
          ))}
        </ul>
      }
    </Menu>
  );
}

export default compose(
  onClickOutside
)(DropDownMenu);
