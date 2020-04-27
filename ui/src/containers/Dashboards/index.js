import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Map, fromJS } from 'immutable';
import { routeNodeSelector } from 'redux-router5';
import { withProps, compose } from 'recompose';
import { withModels, withModel } from 'ui/utils/hocs';
import { loggedInUserId } from 'ui/redux/modules/auth';
import DashboardList from 'ui/containers/DashboardList';
import DashboardTemplates from 'ui/containers/DashboardTemplates';

const schema = 'dashboards';

const DashboardLists = compose(
  withProps({
    schema,
    sort: fromJS({ createdAt: -1, _id: -1 }),
  }),
  withModels,
  withModel,
)(DashboardList);

const enhance = compose(
  connect(
    state => ({
      userId: loggedInUserId(state),
      route: routeNodeSelector('organisation.dashboards')(state).route,
    })
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
  )
);

const Dashboards = () => {
  const [addDashbord, setAddDashbord] = useState(false);

  const openDashboard = () => setAddDashbord(true);
  const closeDashboard = () => setAddDashbord(false);

  return (
    <div>
      <header id="topbar">
        <div className="heading heading-light">
          <span className="pull-right open_panel_btn" >
            <button
              className="btn btn-primary btn-sm"
              ref={() => {}}
              onClick={openDashboard}>
              <i className="ion ion-plus" /> Add Dashboard
            </button>
          </span>
          Dashboards
        </div>
      </header>
      <div className="row">
        {addDashbord && (
          <div className="col-md-12">
            <DashboardTemplates handleClose={closeDashboard} />
          </div>
        )}

        <div className="col-md-12">
          <DashboardLists />
        </div>
      </div>
    </div>
  );
};

export default enhance(Dashboards);
