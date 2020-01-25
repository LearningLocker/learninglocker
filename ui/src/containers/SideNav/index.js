import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List, Map } from 'immutable';
import Link from 'ui/containers/Link';
import mapValues from 'lodash/mapValues';
import { connect } from 'react-redux';
import { routeNodeSelector } from 'redux-router5';
import { compose, withProps } from 'recompose';
import { withModel } from 'ui/utils/hocs';
import SideNavFooter from 'ui/components/SideNavFooter';
import OrgLogo from 'ui/components/OrgLogo';
import CollapsibleNav from 'ui/containers/SideNav/CollapsibleNav';
import { activeOrganisationSettingsSelector, currentScopesSelector } from 'ui/redux/modules/auth';
import { activeOrgIdSelector } from 'ui/redux/modules/router';
import canViewModel from 'lib/services/auth/canViewModel';
import {
  NavSideNav,
  OrgAvatar,
  SideNavContainer,
  SideNavInner,
  SideNavFooter as SideNavFooterWrapper,
  SideNavHeader,
  activeLinkClassName
} from 'ui/containers/SideNav/styled';

class SideNav extends Component {
  static propTypes = {
    model: PropTypes.instanceOf(Map),
  };

  static contextTypes = {
    router: PropTypes.object
  };

  static defaultProps = {
    currentScopes: new List(),
    model: new Map(),
    activeOrganisationSettings: new Map(),
  };

  state = {
    groups: {}
  }

  onClickMenuItem = (routeName) => {
    const { groups } = this.state;
    const isOpen = !!groups[routeName];
    const newState = mapValues(groups, () => false);

    this.setState({
      groups: {
        ...newState,
        [routeName]: !isOpen
      }
    });
  }

  renderLink = (activeClass, routeName, text) => {
    const organisationId = this.props.activeRoute.params.organisationId;

    return (
      <li>
        <Link
          routeName={routeName}
          routeParams={{ organisationId }}
          activeClassName={activeClass}>
          {text}
        </Link>
      </li>
    );
  };

  renderSettingsLink = (routeSuffix, modelName) => {
    const routeName = `organisation.settings.${routeSuffix}`;
    const activeClass = `v-link-active ${activeLinkClassName}`;
    return this.renderLink(activeClass, routeName, modelName);
  };

  renderSettings = () => {
    const { activeRoute } = this.props;
    const { groups } = this.state;
    const organisationId = activeRoute.params.organisationId;
    const activeScopes = this.props.activeScopes.toJS();
    const canViewStores = canViewModel('store', activeScopes);
    const canViewUsers = canViewModel('user', activeScopes);
    const canViewOrganisations = canViewModel('organisation', activeScopes);
    const canViewClients = canViewModel('client', activeScopes);
    const canViewRoles = canViewModel('role', activeScopes);
    const canViewSettings = (
      canViewStores || canViewUsers || canViewOrganisations || canViewClients || canViewRoles
    );

    return (
      !canViewSettings ? <noscript /> : (
        <CollapsibleNav
          onClick={this.onClickMenuItem}
          routeName={'organisation.settings'}
          manuallyExpanded={!!groups['organisation.settings']}
          routeParams={{ organisationId }}
          label={'Settings'}
          icon={'ion ion-gear-a'} >
          {canViewStores && this.renderSettingsLink('stores', 'Stores')}
          {canViewUsers && this.renderSettingsLink('users', 'Users')}
          {canViewOrganisations && this.renderSettingsLink('suborgs', 'Organisations')}
          {canViewClients && this.renderSettingsLink('clients', 'Clients')}
          {canViewRoles && this.renderSettingsLink('roles', 'Roles')}
          {this.renderSettingsLink('apps', 'Apps')}
        </CollapsibleNav>
      )
    );
  }

  renderPeople = () => {
    const { activeRoute } = this.props;
    const { groups } = this.state;
    const organisationId = activeRoute.params.organisationId;
    const activeScopes = this.props.activeScopes.toJS();
    const activeClass = `v-link-active ${activeLinkClassName}`;
    const canViewPeople = canViewModel('persona', activeScopes);

    return !canViewPeople ? <noscript /> : (
      <CollapsibleNav
        onClick={this.onClickMenuItem}
        routeName={'organisation.people'}
        manuallyExpanded={!!groups['organisation.people']}
        routeParams={{ organisationId }}
        label={'People'}
        icon={'ion ion-person-stalker'} >
        {this.renderLink(activeClass, 'organisation.people.manage', 'Manage')}
        {this.renderLink(activeClass, 'organisation.people.imports', 'Import')}
      </CollapsibleNav>
    );
  };

  render() {
    const { model, activeRoute } = this.props;
    const { groups } = this.state;
    const organisationId = activeRoute.params.organisationId;
    const activeClass = `v-link-active ${activeLinkClassName}`;

    return (
      <SideNavContainer className={'col-sm-3 col-md-2'} >
        <SideNavInner>
          <SideNavHeader>
            <OrgAvatar>
              <OrgLogo organisation={model} />
            </OrgAvatar>
            <div className="media-body">
              <div style={{ textAlign: 'center' }}>
                {model.get('name')}
              </div>
            </div>
          </SideNavHeader>

          <NavSideNav className={'nav'}>
            <CollapsibleNav
              onClick={this.onClickMenuItem}
              routeName={'organisation.data'}
              routeParams={{ organisationId }}
              label={'Data'}
              manuallyExpanded={!!groups['organisation.data']}
              icon={'ion ion-ionic'}>
              {this.renderLink(activeClass, 'organisation.data.dashboards', 'Dashboards')}
              {this.renderLink(activeClass, 'organisation.data.visualise', 'Visualise')}
              {this.renderLink(activeClass, 'organisation.data.source', 'Source')}
              {this.renderLink(activeClass, 'organisation.data.statementForwarding', 'Statement Forwarding')}
            </CollapsibleNav>

            {this.renderPeople()}
            {this.renderSettings()}
          </NavSideNav>

          <SideNavFooterWrapper>
            <SideNavFooter />
          </SideNavFooterWrapper>
        </SideNavInner>
      </SideNavContainer>
    );
  }
}

export default compose(
  connect(state =>
    ({
      activeRoute: routeNodeSelector('organisation')(state).route,
      activeOrganisationSettings: activeOrganisationSettingsSelector(state),
      activeScopes: currentScopesSelector(state),
      id: activeOrgIdSelector(state)
    })
  ),
  withProps(() => ({
    schema: 'organisation'
  })),
  withModel
)(SideNav);
