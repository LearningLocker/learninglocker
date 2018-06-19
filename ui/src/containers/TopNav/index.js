import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { compose, withHandlers } from 'recompose';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { loggedInUserSelector, logout, orgLogout, liveWebsocketToggle } from 'ui/redux/modules/auth';
import { Map, List } from 'immutable';
import bannerImg from 'ui/static/whiteLogo.png';
import SaveBar from 'ui/containers/SaveBar';
import Switch from 'ui/components/Material/Switch';
import styles from './topnav.css';

class TopNav extends Component {
  static propTypes = {
    logout: PropTypes.func,
    orgLogout: PropTypes.func,
    user: PropTypes.instanceOf(Map)
  };

  static defaultProps = {
    user: new Map()
  }

  onClickSwitchOrg = () => {
    this.props.orgLogout();
  }

  render() {
    const { user, toggleWebsockets, liveWebsocket } = this.props;
    const organisations = user.get('organisations', new List());
    return (
      <div className={`${styles['topnav-wrapper']}`}>
        <div className={`navbar navbar-fixed-top clearfix ${styles['navbar-topnav']}`} role="navigation">
          <div className="navbar-header">
            <div className={styles['navbar-brand']}>
              <img alt="banner img" src={bannerImg} className={styles.bannerImg} />
            </div>
          </div>
          <div className="container-fluid">
            <div id="navbar" className="nav-icons">
              <div id={`${styles['topnav-switch']}`}>
                <Switch
                  onChange={toggleWebsockets}
                  checked={liveWebsocket} />
              </div>
              <a className="pull-right option" title="Logout" onClick={this.props.logout}><i className="icon ion-log-out" /></a>
              {organisations.size > 0 && <a className="pull-right option" title="Switch organisation" onClick={this.onClickSwitchOrg}><i className="icon ion-arrow-swap" /></a>}
            </div>
          </div>
        </div>
        <SaveBar />
      </div>
    );
  }
}

export default compose(
  withStyles(styles),
  connect(state => ({
    user: loggedInUserSelector(state),
    liveWebsocket: state.auth.get('liveWebsockets')
  }), { logout, orgLogout, liveWebsocketToggle }),
  withHandlers({
    toggleWebsockets: ({ liveWebsocketToggle: liveWebsocketToggleAction }) => (value) => {
      liveWebsocketToggleAction(value);
    }
  }),
)(TopNav);
