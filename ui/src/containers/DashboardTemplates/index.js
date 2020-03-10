import React from 'react';
import { CardList, Panel } from 'ui/containers/DashboardTemplates/styled';
import BlankDashboard from './BlankDashboard';
import StreamStarter from './StreamStarter';
import GettingStarted from './GettingStarted';

const DashboardTemplates = () => (
  <Panel className={'panel panel-default'}>

    <label htmlFor="dashboard-templates">
      Custom Templates
    </label>

    <CardList id="dashboard-templates">
      <BlankDashboard />
      <GettingStarted />
      <StreamStarter />
    </CardList>
  </Panel>
);

export default DashboardTemplates;
