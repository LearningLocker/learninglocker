import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Iterable } from 'immutable';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import Spinner from 'ui/components/Spinner';
import { withModels } from 'ui/utils/hocs';
import { loggedInUserId } from 'ui/redux/modules/auth';
import { routeNodeSelector, actions } from 'redux-router5';
import { compose, defaultProps, setPropTypes, withHandlers, withProps } from 'recompose';
import { activeOrgIdSelector } from 'ui/redux/modules/router';
import { isLoadingSelector } from 'ui/redux/modules/pagination';
import DashboardCard from 'ui/containers/DashboardCard';
import styles from './styles.css';

const enhance = compose(
  setPropTypes({
    schema: PropTypes.string.isRequired,
    isLoading: PropTypes.bool.isRequired,
    hasMore: PropTypes.bool.isRequired,
    models: PropTypes.instanceOf(Iterable).isRequired,
    model: PropTypes.object,
    fetchMore: PropTypes.func.isRequired,
    getModelKey: PropTypes.func,
  }),
  defaultProps({
    getModelKey: model => model.get('_id', Math.random().toString()),
  }),
  withStyles(styles),
  connect(
    state => ({
      mod: state,
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
    first: 12,
    noItemsDisplay: 'No items.',
    getModelKey: model => model.get('_id', Math.random().toString())
  }),
  withModels,
  withProps(
    ({ route }) => ({
      id: route.name === 'organisation.data.dashboards.add' ? undefined : route.params.dashboardId
    })
  ),
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
    handleDashboard: ({
      navigateTo,
      route,
    }) => (dashboardId) => {
      const organisationId = route.params.organisationId;
      if (dashboardId) {
        navigateTo('organisation.data.dashboards.id', {
          organisationId,
          dashboardId
        });
      }
    }
  }),
);

const renderLoadMoreButton = ({ isLoading, hasMore, fetchMore }) =>
  (
    <div style={{ marginTop: '20px' }}>
      { isLoading ? (
        <Spinner />
      ) : (
        hasMore &&
          <button className="btn btn-default" onClick={fetchMore} >
            Load more
          </button>
      )}
    </div>
  );

const ModelList = ({
  isLoading,
  modelsWithModel,
  hasMore,
  schema,
  fetchMore,
  noItemsDisplay,
  getModelKey,
  route,
  ...other
}) => {
  if (modelsWithModel.size > 0) {
    return (
      <div className={styles.dashboardList}>
        {
          modelsWithModel.map((model, index) => (
            <DashboardCard
              {...other}
              params={route.params}
              key={getModelKey(model)}
              index={index}
              model={model}
              schema={schema} />
            )).valueSeq()
        }

        { isLoading
          ? <Spinner />
          : renderLoadMoreButton({ isLoading, hasMore, fetchMore })
        }
      </div>
    );
  } else if (isLoading) {
    return <Spinner />;
  }
  return (
    <div className="row">
      <div className="col-md-12"><h4>{ noItemsDisplay }</h4></div>
    </div>
  );
};

export default enhance(ModelList);
