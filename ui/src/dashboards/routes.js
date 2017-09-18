import React from 'react';
import { Route } from 'react-router';
import { App, EmbeddableDashboard } from 'ui/containers';

export default () =>
  <Route path="/dashboards/" component={App}>
    <Route path=":dashboardId" component={EmbeddableDashboard} />
  </Route>;
