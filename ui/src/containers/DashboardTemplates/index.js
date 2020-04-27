import React from 'react';
import { CardList, Panel, DashboardTitle } from 'ui/containers/DashboardTemplates/styled';
import BlankDashboard from './BlankDashboard';
import StreamStarter from './StreamStarter';
import GettingStarted from './GettingStarted';


const DashboardTemplates = ({ handleClose }) => (
  <Panel className={'panel panel-default'}>

    <DashboardTitle>
      <label htmlFor="dashboard-templates">
        Add Dashboard
      </label>
      <div
        className="close"
        onClick={handleClose}>
        <i className="ion-close-round" />
      </div>
    </DashboardTitle>
    <p>
      Start by selecting a blank dashboard or choose a template
    </p>

    <CardList id="dashboard-templates">
      <BlankDashboard />
      <GettingStarted />
      <StreamStarter />
    </CardList>
  </Panel>
);

export default DashboardTemplates;
