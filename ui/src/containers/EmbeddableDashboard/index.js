import React, { PropTypes } from 'react';
import { Map, List } from 'immutable';
import { withProps, compose, setPropTypes } from 'recompose';
import { routeNodeSelector } from 'redux-router5';
import { withModel } from 'ui/utils/hocs';
import DashboardGrid from 'ui/containers/DashboardGrid';
import { connect } from 'react-redux';
import get from 'lodash/get';

const enhance = compose(
  connect(state => ({
    dashboardId: get(
      routeNodeSelector('embedded-dashboard')(state),
      ['route', 'params', 'dashboardId']
    ),
  })),
  withProps(({ dashboardId, id }) => ({
    schema: 'dashboard',
    id: id || dashboardId,
  })),
  withModel,
  setPropTypes({
    model: PropTypes.instanceOf(Map).isRequired,
  })
);

const render = ({ model, organisationId }) => (<DashboardGrid
  organisationId={organisationId}
  widgets={model.get('widgets', new List())}
  editable={false} />
);

export default enhance(render);
