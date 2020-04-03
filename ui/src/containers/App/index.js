import React from 'react';
import Helmet from 'react-helmet';
import { compose } from 'recompose';
import 'react-virtualized/styles.css';
import Toasts from 'ui/containers/Toasts';
import NotFound from 'ui/components/NotFound';
import config from 'ui/config';
import { connect } from 'react-redux';
import { routeNodeSelector } from 'redux-router5';
import { startsWithSegment } from 'router5.helpers';
import get from 'lodash/get';
import createAsyncComponent from 'ui/utils/createAsyncComponent';
import SaveBarErrors from 'ui/containers/SaveBarErrors';

const renderPage = (routeName) => {
  const testRoute = startsWithSegment(routeName);

  if (testRoute('login')) {
    return React.createElement(createAsyncComponent({
      loader: System.import('ui/pages/LoginPage')
    }));
  }
  if (testRoute('home')) {
    return React.createElement(createAsyncComponent({
      loader: System.import('ui/pages/HomePage')
    }));
  }
  if (testRoute('organisation')) {
    return React.createElement(createAsyncComponent({
      loader: System.import('ui/containers/OrganisationHome')
    }));
  }
  if (testRoute('admin')) {
    return React.createElement(createAsyncComponent({
      loader: System.import('ui/containers/Admin')
    }));
  }
  if (testRoute('forgot')) {
    return React.createElement(createAsyncComponent({
      loader: System.import('ui/pages/ForgotPasswordPage')
    }));
  }
  if (testRoute('reset')) {
    return React.createElement(createAsyncComponent({
      loader: System.import('ui/pages/ResetPasswordPage')
    }));
  }
  if (
    testRoute('embedded-dashboard')
  ) {
    return React.createElement(createAsyncComponent({
      loader: System.import('ui/containers/EmbeddableDashboard')
    }));
  }

  return <NotFound />;
};

const component = ({ route }) => {
  const name = get(route, 'name', '');
  return (
    <div>
      <Helmet {...config.app.head} />
      {renderPage(name)}
      <Toasts />
      <SaveBarErrors />
    </div>
  );
};

export default compose(
  connect(() => routeNodeSelector(''))
)(component);
