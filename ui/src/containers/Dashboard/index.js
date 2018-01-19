import React, { PropTypes, Component } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { Map, List, is } from 'immutable';
import Input from 'ui/components/Material/Input';
import { withProps, compose } from 'recompose';
import { withModel } from 'ui/utils/hocs';
import DashboardGrid from 'ui/containers/DashboardGrid';
import DeleteButton from 'ui/containers/DeleteButton';
import Owner from 'ui/containers/Owner';
import PrivacyToggleButton from 'ui/containers/PrivacyToggleButton';
import DashboardSharing from 'ui/containers/DashboardSharing';
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

  onChangeWidgets = (newWidgets) => {
    if (is(this.props.model.get('widgets'), newWidgets)) {
      return;
    }
    this.props.updateModel({ path: ['widgets'], value: newWidgets });
  };

  onClickAddWidget = () => {
    const newWidgetsAttr = this.props.model
      .get('widgets', new List())
      .push(new Map());
    this.props.saveModel({ attrs: new Map({ widgets: newWidgetsAttr }) });
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

  onChangeWidgetVisualisation = (widgetIndex, visualisation) => {
    this.onWidgetChange([widgetIndex, 'visualisation'], visualisation);
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
    const { model, organisationId } = this.props;

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
            <PrivacyToggleButton id={model.get('_id')} schema={schema} white />
            <DeleteButton white id={model.get('_id')} schema={schema} />
            <button
              className="btn btn-default btn-sm flat-btn flat-white"
              title="Share"
              onClick={this.toggleSharing}>
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
        <DashboardGrid
          organisationId={organisationId}
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
    });
  ),
  withModel
)(Dashboard);
