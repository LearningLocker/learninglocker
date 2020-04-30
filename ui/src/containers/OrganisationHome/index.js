import React from 'react';
import { connect } from 'react-redux';
import { startsWithSegment } from 'router5.helpers';
import { routeNodeSelector } from 'redux-router5';
import Helmet from 'react-helmet';
import TopNav from 'ui/containers/TopNav';
import SideNav from 'ui/containers/SideNav';
import createAsyncComponent from 'ui/utils/createAsyncComponent';
import AuthContainer from 'ui/containers/AuthContainer';
import NotFound from 'ui/components/NotFound';

const renderPage = (routeName) => {
  const testRoute = startsWithSegment(routeName);

  // Data //
  if (testRoute('organisation.data.dashboards.id')) {
    return React.createElement(createAsyncComponent({
      loader: System.import('ui/containers/Dashboard')
    }));
  }

  if (testRoute('organisation.data.dashboards')) {
    return React.createElement(createAsyncComponent({
      loader: System.import('ui/containers/Dashboards')
    }));
  }

  if (testRoute('organisation.data.visualise')) {
    return React.createElement(createAsyncComponent({
      loader: System.import('ui/containers/Visualise')
    }));
  }

  if (testRoute('organisation.data.source')) {
    return React.createElement(createAsyncComponent({
      loader: System.import('ui/pages/DataSourcePage')
    }));
  }

  if (testRoute('organisation.data.statementForwarding')) {
    return React.createElement(createAsyncComponent({
      loader: System.import('ui/pages/DataStatementForwardingPage')
    }));
  }

  // People //

  if (testRoute('organisation.people.imports')) {
    return React.createElement(createAsyncComponent({
      loader: System.import('ui/pages/PeopleImportPage')
    }));
  }

  if (testRoute('organisation.people.manage')) {
    return React.createElement(createAsyncComponent({
      loader: System.import('ui/pages/PeopleManagePage')
    }));
  }

  // Settings //

  if (testRoute('organisation.settings.stores')) {
    return React.createElement(createAsyncComponent({
      loader: System.import('ui/pages/SettingsStoresPage')
    }));
  }

  if (testRoute('organisation.settings.users')) {
    return React.createElement(createAsyncComponent({
      loader: System.import('ui/pages/SettingsUsersPage')
    }));
  }

  if (testRoute('organisation.settings.roles')) {
    return React.createElement(createAsyncComponent({
      loader: System.import('ui/pages/SettingsRolesPage')
    }));
  }

  if (testRoute('organisation.settings.suborgs')) {
    return React.createElement(createAsyncComponent({
      loader: System.import('ui/pages/SettingsOrganisationsPage')
    }));
  }

  if (testRoute('organisation.settings.clients')) {
    return React.createElement(createAsyncComponent({
      loader: System.import('ui/pages/SettingsClientsPage')
    }));
  }

  if (testRoute('organisation.settings.apps')) {
    return React.createElement(createAsyncComponent({
      loader: System.import('ui/pages/SettingsAppsPage')
    }));
  }

  if (testRoute('organisation.apps.salesDemo')) {
    return React.createElement(createAsyncComponent({
      loader: System.import('ui/pages/SettingsAppsPage/subpages/SalesDemoAppPage'),
    }));
  }

  if (testRoute('organisation.apps')) {
    return React.createElement(createAsyncComponent({
      loader: System.import('ui/pages/SettingsAppsPage')
    }));
  }

  return <NotFound />;
};

const organisationHome = ({ route }) => {
  const { name } = route;

  return (
    <div id="app">
      <AuthContainer>
        <Helmet title=" - Welcome" />
        <TopNav />
        <div
          className="container-fluid"
          style={{
            marginTop: '56px',
            minHeight: '600px',
            position: 'relative'
          }} >
          <SideNav />
          <div className="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 main">
            {renderPage(name)}
          </div>
        </div>
      </AuthContainer>
    </div>
  );
};

export default connect(
  state => ({
    route: routeNodeSelector('organisation')(state).route,
    data: routeNodeSelector('organisation.data')(state).route,
    people: routeNodeSelector('organisation.people')(state).route,
    settings: routeNodeSelector('organisation.settings')(state).route,
  })
)(organisationHome);
