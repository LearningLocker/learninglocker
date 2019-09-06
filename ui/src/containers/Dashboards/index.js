import React from 'react';
import { isLoadingSelector } from 'ui/redux/modules/pagination';
import Tabs from 'ui/components/Material/Tabs';
import { Tab } from 'react-toolbox/lib/tabs';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import { routeNodeSelector, actions } from 'redux-router5';
import { withProps, compose, withHandlers } from 'recompose';
import {
  withModels,
  withModel
} from 'ui/utils/hocs';
import { loggedInUserId } from 'ui/redux/modules/auth';
import Spinner from 'ui/components/Spinner';
import Dashboard from 'ui/containers/Dashboard';
import DashboardTemplates from 'ui/containers/DashboardTemplates';
import { activeOrgIdSelector } from 'ui/redux/modules/router';

const ADD_ROUTE = 'add';

const StyledSpinner = () => (
  <div style={{ height: '60vh', display: 'flex' }}>
    <Spinner />
  </div>
);

const NoDashboards = () => (
  <div>
    <h3>{"You don't have any dashboards yet! Add one to get started."}</h3>
    <DashboardTemplates />
  </div>
);

const renderDashboard = params => (model, index) => (
  <Tab key={index} label={model.get('title', `Dashboard ${index + 1}`, '')}>
    <Dashboard id={model.get('_id')} params={params} />
  </Tab>
);


const enhance = compose(
  connect(
    state => ({
      isLoading: isLoadingSelector('dashboard', new Map())(state),
      userId: loggedInUserId(state),
      route: routeNodeSelector('organisation.dashboards')(state).route,
      organisation: activeOrgIdSelector(state)
    }),
    { navigateTo: actions.navigateTo }
  ),
  withProps({
    schema: 'dashboard',
    filter: new Map(),
    first: 300,
  }),
  withModels,
  withProps(
    ({ route }) => ({
      id: route.name === 'organisation.data.dashboards.add' ? undefined : route.params.dashboardId
    })
  ),
  withModel,
  withProps(
    ({
      id,
      models,
      model
    }) => {
      if (model.size === 0 && id) {
        return ({
          modelsWithModel: models
        });
      }

      return ({
        modelsWithModel: !id || models.has(id) ? models : models.reverse().set(id, model).reverse()
      });
    }
  ),
  withHandlers({
    handleTabChange: ({
      models,
      modelsWithModel,
      navigateTo,
      route,
    }) => (tabIndex) => {
      const organisationId = route.params.organisationId;
      if (tabIndex === models.size) {
        navigateTo('organisation.data.dashboards.add', { organisationId });
        return;
      }
      const selectedDashboard = modelsWithModel.toList().get(tabIndex);
      navigateTo('organisation.data.dashboards.id', {
        organisationId,
        dashboardId: selectedDashboard.get('_id'),
      });
    }
  }),
);

const Dashboards = ({
  handleTabChange,
  isLoading,
  modelsWithModel,
  models,
  route,
}) => {
  if (isLoading) {
    return <StyledSpinner />;
  }

  if (modelsWithModel.size === 0) {
    return <NoDashboards />;
  }

  const activeTab = (route.name === 'organisation.data.dashboards.add') ?
    models.size :
    modelsWithModel.toList().keyOf(modelsWithModel.get(route.params.dashboardId));

  return (
    <Tabs index={activeTab} onChange={handleTabChange}>
      {modelsWithModel.map(renderDashboard(route.params)).valueSeq()}
      <Tab label={ADD_ROUTE} >
        <DashboardTemplates />
      </Tab>
    </Tabs>
  );
};

export default enhance(Dashboards);
