/* eslint-disable react/jsx-indent */
import React, { Component, PropTypes } from 'react';
import Helmet from 'react-helmet';
import DebounceInput from 'react-debounce-input';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { Card, CardText } from 'react-toolbox/lib/card';
import { List, ListItem } from 'react-toolbox/lib/list';
import { Map, List as ImmutList, fromJS } from 'immutable';
import { AutoSizer, List as VirtualList, InfiniteLoader } from 'react-virtualized';
import { withProps, compose, withState } from 'recompose';
import { actions as routerActions } from 'redux-router5';
import { isSiteAdminSelector, authenticationSelector, logout, orgLoginStart, loggedInUserSelector } from 'ui/redux/modules/auth';
import { queryStringToQuery } from 'ui/redux/modules/search';
import { withSchema } from 'ui/utils/hocs';
import Spinner from 'ui/components/Spinner';
import FullPageBackground from 'ui/components/FullPageBackground';
import AuthContainer from 'ui/containers/AuthContainer';
import smallLogo from 'ui/static/smallLogo.png';
import styles from './styles.css';

class Home extends Component {
  static propTypes = {
    models: PropTypes.instanceOf(ImmutList),
    fetchMore: PropTypes.func,
    modelCount: PropTypes.number,
    logout: PropTypes.func,
    orgLoginStart: PropTypes.func,
    navigateTo: PropTypes.func,
    isSiteAdmin: PropTypes.bool,
    auth: PropTypes.instanceOf(Map),
    orgSearch: PropTypes.string,
    setOrgSearch: PropTypes.func,
  }

  static defaultProps = {
    models: new ImmutList(),
    auth: new Map(),
    authUser: new Map(),
    isSiteAdmin: false
  }

  onOrgSearch = (event) => {
    this.props.setOrgSearch(event.target.value);
  }

  onClickOrgLogin = (orgId, e) => {
    if (e) e.preventDefault();
    this.props.orgLoginStart({ organisation: orgId });
  }

  onClickLogout = (e) => {
    if (e) e.preventDefault();
    this.props.logout();
  }

  gotoSiteAdminUsers = (e) => {
    if (e) e.preventDefault();
    this.props.navigateTo('admin.users');
  }

  gotoSiteAdminOrgs = (e) => {
    if (e) e.preventDefault();
    this.props.navigateTo('admin.organisations');
  }

  isOrganisationLoaded = ({ index }) => {
    const { models } = this.props;
    return models.has(index);
  }

  renderOrg = ({ key, style, index }) => {
    const { models } = this.props;
    if (models.has(index)) {
      const organisation = models.get(index);
      return (
        <div key={key} style={style}>
          <ListItem
            selectable
            ripple
            onClick={this.onClickOrgLogin.bind(null, organisation.get('_id'))}
            avatar={organisation.get('logoPath') ? organisation.get('logoPath') : smallLogo}
            caption={organisation.get('name')} />
        </div>
      );
    }
    return (
      <div key={key} style={style}>
        <ListItem selectable ripple caption="Loading..." />
      </div>
    );
  }

  renderOrgList = () => {
    const { modelCount, models } = this.props;
    const rowCount = modelCount || models.size;
    const rowHeight = 56;

    return (
      <AutoSizer disableHeight>
        {({ width }) => (
          <InfiniteLoader
            isRowLoaded={this.isOrganisationLoaded}
            loadMoreRows={this.props.fetchMore}
            rowCount={rowCount} >
            {({ onRowsRendered, registerChild }) => (
              <List>
                <VirtualList
                  width={width}
                  height={Math.min(6, rowCount) * rowHeight}
                  onRowsRendered={onRowsRendered}
                  ref={registerChild}
                  rowCount={rowCount}
                  rowHeight={rowHeight}
                  rowRenderer={this.renderOrg} />
              </List>
            )}
          </InfiniteLoader>
        )}
      </AutoSizer>
    );
  }

  renderEmptySearch = () => {
    const { isLoading } = this.props;
    if (isLoading) return <Spinner />;
    return (
      <div style={{ marginTop: '5px', textAlign: 'center' }}>
        You do not belong to any organisations matching that search.
      </div>
    );
  }

  renderNoUserOrgs = () => {
    const { isLoading } = this.props;
    if (isLoading) return <Spinner />;
    return (
      <div style={{ marginTop: '5px', textAlign: 'center' }}>
        You have not been added to any organisations.
      </div>
    );
  }

  render() {
    const { auth, isSiteAdmin, models, orgSearch } = this.props;
    const error = auth.get('error');

    return (
      <FullPageBackground>
        <AuthContainer>
          <h3>Choose your organisation</h3>
          <Card>
            <CardText>
              <Helmet title=" - Choose an organisation" />
              { isSiteAdmin && (
                <div>
                  <h4>Site Administration</h4>
                  <List selectable ripple>
                    <ListItem
                      leftIcon={<i className="ion-ios-people" />}
                      onClick={this.gotoSiteAdminUsers}
                      caption="View all users"
                      flat />
                    <ListItem
                      leftIcon={<i className="glyphicon glyphicon-tree-conifer" />}
                      onClick={this.gotoSiteAdminOrgs}
                      caption="View all organisations"
                      flat />
                  </List>
                </div>
              ) }

              {
                models.isEmpty() && orgSearch === '' ? (
                  this.renderNoUserOrgs()
                ) : (
                  <div>
                    <div>
                      <h4>Your Organisations</h4>
                      {
                        orgSearch !== '' || models.size > 5 ? (
                          <DebounceInput
                            className="form-control"
                            debounceTimeout={377}
                            value={orgSearch}
                            onChange={this.onOrgSearch} />
                        ) : <noscript />
                      }
                      { models.isEmpty() ? this.renderEmptySearch() : this.renderOrgList() }
                    </div>
                  </div>
                )
              }
              {error &&
                <div className="alert alert-danger" role="alert">
                  <span className="sr-only">Error:</span> {error}
                </div>
              }
            </CardText>
          </Card>

          <div className={styles.loginButtons}>
            <button className="btn btn-danger" onClick={this.onClickLogout}>
              <i className="ion ion-log-out" /> Log Out
            </button>
          </div>
        </AuthContainer>
      </FullPageBackground>
    );
  }
}

export default compose(
  withStyles(styles),
  connect(state => ({
    auth: authenticationSelector(state),
    authUser: loggedInUserSelector(state),
    isSiteAdmin: isSiteAdminSelector(state)
  }), { logout, orgLoginStart, navigateTo: routerActions.navigateTo }),
  withState('orgSearch', 'setOrgSearch', ''),
  withProps(({ authUser, orgSearch }) => {
    const userOrgs = authUser.get('organisations', new ImmutList());
    const searchFilter = queryStringToQuery(orgSearch, 'organisation');
    const userFilter = fromJS({ _id: { $in: userOrgs } });
    const filter = userFilter.merge(searchFilter);
    const sort = fromJS({ name: 1, _id: -1 });
    return { filter, sort };
  }),
  withSchema('organisation'),
  withProps(({ models }) => ({ models: models.toList() }))
)(Home);
