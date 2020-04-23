import React, { Component } from 'react';
import { isLoadingSelector } from 'ui/redux/modules/pagination';
import PropTypes from 'prop-types';
import * as _ from 'lodash';
import Scroll from 'react-scroll';
import { connect } from 'react-redux';
import { actions, routeNodeSelector } from 'redux-router5';
import { withProps, compose, lifecycle, withHandlers, mapProps } from 'recompose';
import { Map, List, is } from 'immutable';
import Input from 'ui/components/Material/Input';
import Spinner from 'ui/components/Spinner';
import DashboardGrid from 'ui/containers/DashboardGrid';
import DashboardSharing from 'ui/containers/DashboardSharing';
import WidgetVisualiseCreator from 'ui/containers/WidgetVisualiseCreator';
import { withModels, withModel } from 'ui/utils/hocs';
import { loggedInUserId } from 'ui/redux/selectors';
import { activeOrgIdSelector } from 'ui/redux/modules/router';
import { EditWrapper } from 'ui/containers/Dashboard/styled';

class Dashboard extends Component {
  static propTypes = {
    model: PropTypes.instanceOf(Map),
    updateModel: PropTypes.func,
    saveModel: PropTypes.func,
    setMetadata: PropTypes.func,
    getMetadata: PropTypes.func,
  };

  static defaultProps = {
    model: new Map()
  };

  constructor(props) {
    super(props);
    this.state = {
      widgetModalOpen: false,
    };
  }

  onChangeWidgets = (newWidgets) => {
    if (is(this.props.model.get('widgets'), newWidgets)) {
      return;
    }
    this.props.updateModel({ path: ['widgets'], value: newWidgets });
  };

  toggleWidgetModal = () => {
    this.setState({ widgetModalOpen: !this.state.widgetModalOpen });
  }

  onClickAddWidget = () => {
    this.toggleWidgetModal();
  };

  onTitleChange = (value) => {
    this.props.updateModel({ path: ['title'], value });
  };

  onWidgetChange = (widgetPath, widgetPatch) => {
    const { model } = this.props;
    const newModel = model.setIn(['widgets', ...widgetPath], widgetPatch);
    const widgetsUpdate = newModel.get('widgets');

    this.props.updateModel({
      path: ['widgets'],
      value: widgetsUpdate
    });
  };

  onChangeWidgetTitle = (widgetIndex, title) => {
    this.onWidgetChange([widgetIndex, 'title'], title);
  };

  onChangeWidgetVisualisation = (widgetIndex, visualisation, title) => {
    const { model } = this.props;
    const newModel = model
      .setIn(['widgets', widgetIndex, 'visualisation'], visualisation)
      .setIn(['widgets', widgetIndex, 'title'], title);
    const widgetsUpdate = newModel.get('widgets');

    this.props.updateModel({
      path: ['widgets'],
      value: widgetsUpdate
    });
  };

  createPopulatedWidget = (widgetIndex) => {
    const model = this.props.model;
    const lastWidget = model.get('widgets').last() || new Map();
    const newModel = model
      .get('widgets', new List())
      .push(new Map({
        visualisation: widgetIndex,
        w: 5,
        h: 8,
        y: lastWidget.get('y', 0) + lastWidget.get('h', 0)
      }));
    this.props.saveModel({ attrs: new Map({ widgets: newModel }) });
    this.toggleWidgetModal();
  };

  onChangeVisibility = (value) => {
    this.props.updateModel({ path: ['visibility'], value });
  };

  onChangeValidDomains = (event) => {
    this.props.updateModel({
      path: ['validDomains'],
      value: event.target.value
    });
  };

  handleFilterChange = (value) => {
    this.props.updateModel({ path: ['filter'], value });
  };

  toggleSharing = () => {
    this.props.setMetadata('isSharing', !this.props.getMetadata('isSharing'));
  };

  render() {
    const { model, backToDashboard } = this.props;

    if (!model.get('_id')) {
      return <Spinner />;
    }

    return (
      <div>
        <header id="topbar">
          <div className="heading heading-light">
            <span className="pull-right open_panel_btn" >
              <a
                onClick={this.onClickAddWidget}
                className="btn btn-primary btn-sm">
                <i className="ion ion-stats-bars" /> Add widget
              </a>

              <button
                className="btn btn-default btn-sm flat-btn flat-white"
                title="Share"
                onClick={this.toggleSharing}
                style={{
                  backgroundColor: this.props.getMetadata('isSharing') ? '#F5AB35' : null,
                  color: this.props.getMetadata('isSharing') ? 'white' : null,
                  marginRight: 0,
                }}>
                <i className="icon ion-android-share-alt" />
              </button>
            </span>
            <EditWrapper>
              <a
                onClick={backToDashboard} >
                <i className="icon ion-chevron-left" />
              </a>
              <Input
                type="text"
                name="Title"
                value={model.get('title', ' ')}
                onChange={this.onTitleChange}
                style={{ fontSize: '18px', color: '#929292', padding: 0 }} />
            </EditWrapper>
          </div>
        </header>
        <div className="row">
          {this.props.getMetadata('isSharing') &&
            <div className="col-md-12">
              <DashboardSharing
                shareable={model.get('shareable', new List())}
                id={model.get('_id')} />
            </div>
          }

          <div className="clearfix" />

          <WidgetVisualiseCreator
            isOpened={this.state.widgetModalOpen}
            model={model}
            onClickClose={() => this.toggleWidgetModal()}
            onChangeVisualisation={this.createPopulatedWidget} />

          <DashboardGrid
            widgets={model.get('widgets')}
            onChange={this.onChangeWidgets}
            onChangeTitle={this.onChangeWidgetTitle}
            onChangeVisualisation={this.onChangeWidgetVisualisation} />
        </div>
      </div>
    );
  }
}

export default compose(
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
  lifecycle({
    componentDidUpdate(previousProps) {
      if (
        this.props.model.get('widgets') && this.props.model.get('widgets').size && previousProps.size &&
        this.props.model.get('widgets').size > previousProps.model.get('widgets').size && window
      ) {
        const scroll = Scroll.animateScroll;
        scroll.scrollToBottom({ smooth: true });
      }
    }
  }),
  withHandlers({
    backToDashboard: ({ route, navigateTo }) => () => {
      const organisationId = route.params.organisationId;
      navigateTo('organisation.data.dashboards', {
        organisationId
      });
    }
  }),
  mapProps(original => _.pick(original, ['model', 'updateModel', 'saveModel', 'setMetadata', 'getMetadata', 'backToDashboard'])),
)(Dashboard);
