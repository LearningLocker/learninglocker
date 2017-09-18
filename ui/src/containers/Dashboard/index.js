import React, { PropTypes, Component } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { Map, List, is } from 'immutable';
import uuid from 'uuid';
import Input from 'ui/components/Material/Input';
import { withProps, compose } from 'recompose';
import QueryBuilder from 'ui/containers/QueryBuilder';
import { withModel } from 'ui/utils/hocs';
import DashboardGrid from 'ui/containers/DashboardGrid';
import DeleteButton from 'ui/containers/DeleteButton';
import DebounceInput from 'react-debounce-input';
import { Card } from 'react-toolbox/lib/card';
import RadioGroup from 'ui/components/Material/RadioGroup';
import RadioButton from 'ui/components/Material/RadioButton';
import getRouteUrl from 'ui/utils/getRouteUrl';
import Owner from 'ui/containers/Owner';
import PrivacyToggleButton from 'ui/containers/PrivacyToggleButton';
import {
  NOWHERE,
  ANYWHERE,
  VALID_DOMAINS
} from 'lib/constants/sharingScopes.js';

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
    const filterId = uuid.v4();
    const filter = model.get('filter', new Map({}));

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
            <Card className={styles.sharingCard}>
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="shareLink">Shareable link</label>
                    <div>
                      <DebounceInput
                        id="shareLink"
                        className={styles.textField}
                        debounceTimeout={377}
                        value={`${getRouteUrl()}/dashboards/${model.get('_id')}`}
                        onChange={() => null} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="visibility">
                      Where can this be viewed?
                    </label>
                    <RadioGroup
                      name="visibility"
                      value={model.get('visibility')}
                      onChange={this.onChangeVisibility}>
                      <RadioButton label="Nowhere" value={NOWHERE} />
                      <RadioButton label="Anywhere" value={ANYWHERE} />
                      <RadioButton
                        label="Only where I choose"
                        value={VALID_DOMAINS} />
                    </RadioGroup>
                  </div>
                  {model.get('visibility') === VALID_DOMAINS &&
                    <div className="form-group">
                      <label htmlFor="validDomains">
                        What are the valid domains?
                      </label>
                      <div>
                        <DebounceInput
                          id="validDomains"
                          className={styles.textField}
                          debounceTimeout={377}
                          value={model.get('validDomains')}
                          onChange={this.onChangeValidDomains} />
                      </div>
                    </div>}
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor={filterId}>Filter</label>
                    <QueryBuilder
                      id={filterId}
                      componentPath={new List(['dashboard', model.get('_id')])}
                      query={filter}
                      onChange={this.handleFilterChange} />
                  </div>
                </div>
              </div>
            </Card>}
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
  withProps(({ params, id }) => ({
    schema,
    id: id || params.dashboardId
  })),
  withModel
)(Dashboard);
