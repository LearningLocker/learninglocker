import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { loggedInUserSelector, logout, orgLogout } from 'ui/redux/modules/auth';
import { Map, List } from 'immutable';
import bannerImg from 'ui/static/whiteLogo.png';
import SaveBar from 'ui/containers/SaveBar';
import styled from 'styled-components';

const TopNavWrapper = styled.div`
  height: 56px;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding: 0 11px 0 0;
  z-index: 11;
`;

const NavbarTopNav = styled.div`
  background-color: #525252;
  border-color: #D88A0E;
  border: none;
  height: 56px; /* see SaveBar/styles.css .container .value {top} */
  left: 0;
  top: 0;
  position: absolute;
  width: 100%;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
`;

const NavbarBrand = styled.div`
  color: white;
  padding: 0;
  display: block;
  margin-top: 0;
  margin-left: 14px;
  line-height: 56px;
  height: 100%;

  img {
    height: 54px;
  }
`;

class TopNav extends Component {
  static propTypes = {
    logout: PropTypes.func,
    orgLogout: PropTypes.func,
    user: PropTypes.instanceOf(Map)
  };

  static defaultProps = {
    user: new Map()
  };

  onClickSwitchOrg = () => {
    this.props.orgLogout();
  };

  renderOrganisationsSwitch = () => {
    const { user } = this.props;
    const organisations = user.get('organisations', new List());

    if (organisations.size <= 0) {
      return null;
    }

    return (
      <a
        className="pull-right option"
        title="Switch organisation"
        onClick={this.onClickSwitchOrg} >
        <i className="icon ion-arrow-swap" />
      </a>
    );
  };

  render() {
    return (
      <TopNavWrapper>
        <NavbarTopNav className={'navbar navbar-fixed-top clearfix'} role="navigation">
          <div className="navbar-header">
            <NavbarBrand>
              <img alt="banner img" src={bannerImg} />
            </NavbarBrand>
          </div>
          <div className="container-fluid">
            <div id="navbar" className="nav-icons">
              <a className="pull-right option" title="Logout" onClick={this.props.logout}>
                <i className="icon ion-log-out" />
              </a>
              {this.renderOrganisationsSwitch()}
            </div>
          </div>
        </NavbarTopNav>
        <SaveBar />
      </TopNavWrapper>
    );
  }
}

export default connect(
  state => ({ user: loggedInUserSelector(state) }),
  { logout, orgLogout }
)(TopNav);
