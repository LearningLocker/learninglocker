import React from 'react';
import { CardList, Panel } from 'ui/containers/DashboardTemplates/styled';
import BlankDashboard from './BlankDashboard';
import CuratrStarter from './CuratrStarter';
import GettingStarted from './GettingStarted';

const DashboardTemplates = () => (
  <Panel className={'panel panel-default'}>

    <label htmlFor="dashboard-templates">
      Custom Templates
    </label>

    <CardList id="dashboard-templates">
      <BlankDashboard />
      <GettingStarted />
      <CuratrStarter />
    </CardList>
  </Panel>
);

export default DashboardTemplates;
