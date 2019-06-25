import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Scroll from 'react-scroll';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { actions as routerActions } from 'redux-router5';
import { withProps, compose, lifecycle } from 'recompose';
import { Map, List, is } from 'immutable';
import { activeOrgIdSelector } from 'ui/redux/modules/router';
import Input from 'ui/components/Material/Input';
import WidgetVisualiseCreator from 'ui/containers/WidgetVisualiseCreator';
import { withModel } from 'ui/utils/hocs';
import DashboardGrid from 'ui/containers/DashboardGrid';
import DeleteButton from 'ui/containers/DeleteButton';
import Owner from 'ui/containers/Owner';
import PrivacyToggleButton from 'ui/containers/PrivacyToggleButton';
import DashboardSharing from 'ui/containers/DashboardSharing';
import Spinner from 'ui/components/Spinner';
import styles from './styles.css';

const schema = 'dashboard';

class Dashboard extends Component {
  static propTypes = {
    model: PropTypes.instanceOf(Map),
    updateModel: PropTypes.func
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
    const { model, organisationId, navigateTo } = this.props;

    if (!model.get('_id')) {
      return <Spinner />;
    }

    return (
      <div className="row">
        <div className={styles.editor}>
          <div className={styles.editWrapper}>
            <div style={{ flexGrow: 1 }}>
              <Input
                type="text"
                name="Title"
                label="Enter title"
                value={model.get('title', ' ')}
                onChange={this.onTitleChange}
                style={{ fontSize: '13px' }} />
            </div>

            &nbsp;&nbsp;

            <a
              onClick={this.onClickAddWidget}
              className="btn btn-default btn-sm flat-btn flat-white">
              <i className="ion ion-stats-bars" /> Add widget
            </a>

            <PrivacyToggleButton
              white
              id={model.get('_id')}
              schema={schema} />

            <DeleteButton
              white
              id={model.get('_id')}
              schema={schema}
              onDeletedModel={() =>
                navigateTo('organisation.data.dashboards', { organisationId })
              } />

            <button
              className="btn btn-default btn-sm flat-btn flat-white"
              title="Share"
              onClick={this.toggleSharing}
              style={{
                backgroundColor: this.props.getMetadata('isSharing') ? '#F5AB35' : null,
                color: this.props.getMetadata('isSharing') ? 'white' : null
              }}>
              <i className="icon ion-android-share-alt" />
            </button>

            <span style={{ marginLeft: 'auto' }}>
              <Owner model={model} />
            </span>
          </div>
          {this.props.getMetadata('isSharing') &&
            <div>
              <DashboardSharing
                shareable={model.get('shareable', new List())}
                id={model.get('_id')} />
            </div>
          }
        </div>

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
    );
  }
}

export default compose(
  withStyles(styles),
  withProps(({ params, id }) =>
    ({
      schema,
      id: id || params.dashboardId
    })
  ),
  withModel,
  lifecycle({
    componentDidUpdate(previousProps) {
      if (this.props.model.get('widgets').size > previousProps.model.get('widgets').size && window) {
        const scroll = Scroll.animateScroll;
        scroll.scrollToBottom({ smooth: true });
      }
    }
  }),
  connect(
    state => ({
      organisationId: activeOrgIdSelector(state)
    }),
    {
      navigateTo: routerActions.navigateTo,
    },
  )
)(Dashboard);
