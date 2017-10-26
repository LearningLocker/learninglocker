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

const renderSpinner = () => (
  <div style={{ height: '60vh', display: 'flex' }}>
    <Spinner />
  </div>
);

const renderDashboard = params => (model, index) => (
  <Tab key={index} label={model.get('title', `Dashboard ${index + 1}`)}>
    <Dashboard id={model.get('_id')} params={params} />
  </Tab>
);

const enhance = compose(
  connect(
    state => ({
      isLoading: isLoadingSelector('dashboard', new Map())(state),
      userId: loggedInUserId(state),
      params: routeNodeSelector('organisation.dashboards')(state).route.params,
      first: 300,
    }),
    { navigateTo: actions.navigateTo }
  ),
  withProps({ schema: 'dashboard', filter: new Map() }),
  withModels,
  withProps(({
      params
    }) => ({
      id: params.dashboardId
    })),
  withModel,
  withProps(
    ({
      id,
      models,
      model
    }) => ({
      modelsWithModel: !id || models.has(id) ? models : models.reverse().set(id, model).reverse()
    })
  ),
  withHandlers({
    pushRoute: ({ navigateTo, params: { organisationId } }) => (dashboardId) => {
      navigateTo('organisation.data.dashboards.id', {
        organisationId,
        dashboardId
      });
    }
  }),
  withHandlers({
    handleAddDashboard: ({ userId, addModel, pushRoute }) => async () => {
      const { model } = await addModel({
        props: {
          owner: userId,
          title: 'New dash',
          isExpanded: true
        }
      });
      pushRoute(model.get('_id'));
    },
    handleDashboardSwitch: ({ modelsWithModel, pushRoute }) => (tab) => {
      const selectedDashboard = modelsWithModel.toList().get(tab);
      pushRoute(selectedDashboard.get('_id'));
    }
  }),
  withHandlers({
    handleTabChange: ({
      models,
      handleAddDashboard,
      handleDashboardSwitch
    }) => (tab) => {
      if (tab === models.size) return handleAddDashboard();
      return handleDashboardSwitch(tab);
    }
  })
);

const render = ({
  handleTabChange,
  handleAddDashboard,
  isLoading,
  // models,
  params,
  // id,
  // model,
  modelsWithModel
}) => {
  if (isLoading) {
    return renderSpinner();
  }

  // Render no dashboards.
  if (modelsWithModel.size === 0) {
    return (
      <h3>
        {"You don't have any dashboards yet! Add one to get started. "}
        <a className="addnew" onClick={handleAddDashboard}>
          <i className="ion ion-plus-circled" />
        </a>
      </h3>
    );
  }

  // Render dashboards.
  const { dashboardId } = params;
  const activeTab = modelsWithModel.toList().keyOf(modelsWithModel.get(dashboardId));

  return (
    <Tabs index={activeTab} onChange={handleTabChange}>
      {modelsWithModel.map(renderDashboard(params)).valueSeq()}
      <Tab label="Add" />
    </Tabs>
  );
};

export default enhance(render);
