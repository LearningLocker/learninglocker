import React from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import TopNav from 'ui/containers/TopNav';
import createAsyncComponent from 'ui/utils/createAsyncComponent';
import { routeNodeSelector } from 'redux-router5';
import { startsWithSegment } from 'router5.helpers';
import AuthContainer from 'ui/containers/AuthContainer';
import AdminSideNav from 'ui/containers/Admin/AdminSideNav';

const renderPage = (routeName) => {
  const testRoute = startsWithSegment(routeName);

  if (testRoute('admin.users')) {
    return React.createElement(createAsyncComponent({
      loader: System.import('ui/containers/SiteUsers')
    }));
  }


  if (testRoute('admin.organisations')) {
    return React.createElement(createAsyncComponent({
      loader: System.import('ui/containers/SiteOrgs')
    }));
  }
};


const render = ({ route }) => {
  const { name } = route;
  return (
    <div id="app">
      <AuthContainer>
        <Helmet title=" - Admin" />
        <TopNav />
        <div
          className="container-fluid"
          style={{
            marginTop: '56px',
            minHeight: '600px',
            position: 'relative'
          }}>
          <AdminSideNav />
          <div className="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 main">
            { renderPage(name) }
          </div>
        </div>
      </AuthContainer>
    </div>
  );
};

export default connect(state => ({
  route: routeNodeSelector('admin')(state).route,
  users: routeNodeSelector('admin.data')(state).route,
  organisations: routeNodeSelector('admin.organisations')(state).route,
}), {})(render);
