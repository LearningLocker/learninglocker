/* eslint-disable react/jsx-indent */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Helmet from 'react-helmet';
import DebounceInput from 'react-debounce-input';
import { connect } from 'react-redux';
import { Card, CardText } from 'react-toolbox/lib/card';
import { List, ListItem } from 'react-toolbox/lib/list';
import { Map, List as ImmutList, fromJS } from 'immutable';
import { AutoSizer, List as VirtualList, InfiniteLoader } from 'react-virtualized';
import { withProps, compose, withState } from 'recompose';
import { actions as routerActions } from 'redux-router5';
import moment from 'moment';
import { isSiteAdminSelector, authenticationSelector, logout, orgLoginStart, loggedInUserSelector, orgLogout } from 'ui/redux/modules/auth';
import { queryStringToQuery } from 'ui/redux/modules/search';
import { withModel, withSchema } from 'ui/utils/hocs';
import Spinner from 'ui/components/Spinner';
import FullPageBackground from 'ui/components/FullPageBackground';
import AuthContainer from 'ui/containers/AuthContainer';
import smallLogo from 'ui/static/smallLogo.png';
import OrgMemberButton from 'ui/containers/OrgMemberButton';
import { SITE_SETTINGS_ID } from 'lib/constants/siteSettings';
import Register from './Register';

const Underline = styled.div`
  height: 0;
  border-bottom: 2px solid #DDA476;
  width: 250px;
  margin: 0 auto;
`;

class Home extends Component {
  static propTypes = {
    models: PropTypes.instanceOf(ImmutList),
    fetchMore: PropTypes.func,
    modelCount: PropTypes.number,
    logout: PropTypes.func,
    orgLogout: PropTypes.func,
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

  componentDidMount = () => {
    const proceedOnce = sessionStorage.getItem('proceedOnce') === 'true';
    this.setState({ proceedOnce });

    const sessionStorageSetHandler = () => {
      this.setState({ proceedOnce: true });
    };

    document.addEventListener('setProceedOnce', sessionStorageSetHandler, false);

    this.props.orgLogout();
  }

  onOrgSearch = (event) => {
    this.props.setOrgSearch(event.target.value);
  }

  onClickOrgLogin = (orgId, e) => {
    if (e) e.preventDefault();

    const { models } = this.props;
    const organisation = models.find(model => orgId === model.get('_id'));

    if (
      !this.props.isSiteAdmin &&
      organisation.get('expiration') && moment(organisation.get('expiration')).isBefore(moment())
    ) {
      return;
    }

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
    const { models, isSiteAdmin } = this.props;
    if (models.has(index)) {
      const organisation = models.get(index);

      const name = organisation.get('name');

      const rightActions = [];
      if (organisation.get('expiration') && moment(organisation.get('expiration')).isBefore(moment())) {
        rightActions.push(
          <span
            key="expired"
            style={{ color: 'red' }}>
            Expired
          </span>
        );
      }
      if (isSiteAdmin) {
        rightActions.push(
          <OrgMemberButton
            key="member"
            schema="organisation"
            id={organisation.get('_id')} />
        );
      }

      return (
        <div key={key} style={style}>
          <ListItem
            selectable
            ripple
            onClick={this.onClickOrgLogin.bind(null, organisation.get('_id'))}
            avatar={organisation.get('logoPath') ? organisation.get('logoPath') : smallLogo}
            caption={name}
            rightActions={rightActions} />
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
    const { auth, isSiteAdmin, models, orgSearch, model, ok } = this.props;
    const error = auth.get('error');
    const dontShowRegistration = (model.size === 0 || model.get('dontShowRegistration') === true || ok === true);
    const bypassRegistration = dontShowRegistration || this.state.proceedOnce;

    return (
      <FullPageBackground>
        <AuthContainer>

        {bypassRegistration ?
          <React.Fragment>
            <Underline />
            <h3>Choose your organisation</h3>
            <Card>
              <CardText>
                <Helmet title=" - Choose an organisation" />
                {isSiteAdmin && (
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
                )}

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
                          {models.isEmpty() ? this.renderEmptySearch() : this.renderOrgList()}
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

            <div style={{ marginTop: 20, textAlign: 'center' }}>
              <button className="btn btn-danger" onClick={this.onClickLogout}>
                <i className="ion ion-log-out" /> Log Out
              </button>
            </div>
          </React.Fragment>
          :
          <Register />
        }
        </AuthContainer>
      </FullPageBackground>
    );
  }
}

export default compose(
  connect(state => ({
    auth: authenticationSelector(state),
    authUser: loggedInUserSelector(state),
    isSiteAdmin: isSiteAdminSelector(state)
  }), { logout, orgLoginStart, orgLogout, navigateTo: routerActions.navigateTo }),
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
  withProps(({ models }) => ({ models: models.toList() })),
  withProps(() => ({
    schema: 'siteSettings',
    id: SITE_SETTINGS_ID
  })),
  withModel,
  withState('ok', 'setOk', false),
)(Home);
