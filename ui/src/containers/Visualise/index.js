import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { routeNodeSelector } from 'redux-router5';
import { withProps, compose } from 'recompose';
import { createDefaultTitle } from 'ui/utils/defaultTitles';
import { Map, fromJS } from 'immutable';
import { queryStringToQuery, modelQueryStringSelector } from 'ui/redux/modules/search';
import { withModels, withModel } from 'ui/utils/hocs';
import { addModel } from 'ui/redux/modules/models';
import { loggedInUserId } from 'ui/redux/modules/auth';
import activeOrgSelector from 'ui/redux/modules/activeOrgSelector';
import VisualiseIcon from 'ui/components/VisualiseIcon';
import SearchBox from 'ui/containers/SearchBox';
import ModelList from 'ui/containers/ModelList';
import VisualiseForm from 'ui/containers/VisualiseForm';
import DeleteButton from 'ui/containers/DeleteButton';
import PrivacyToggleButton from 'ui/containers/PrivacyToggleButton';
import CopyButton from './CopyButton';

const schema = 'visualisation';

/**
 * @param {string} orgTimezone
 */
const VisualisationList = compose(
  withProps({
    schema,
    sort: fromJS({ createdAt: -1, _id: -1 }),
  }),
  withModels,
  withModel,
)(ModelList);

class Visualise extends Component {
  static propTypes = {
    userId: PropTypes.string,
    addModel: PropTypes.func,
    searchString: PropTypes.string,
    visualisationId: PropTypes.string, // optional
    organisationModel: PropTypes.instanceOf(Map),
  };

  static defaultProps = {
    organisationModel: new Map(),
  }

  onClickAdd = () => {
    this.addButton.blur();
    this.props.addModel({
      schema,
      props: new Map({
        owner: this.props.userId,
        isExpanded: true,
        timezone: null,
      })
    });
  }

  populateTitle = (model) => {
    if (model.get('description')) {
      return (<span style={{ fontWeight: 700 }}>{model.get('description')}</span>);
    }
    return (<span style={{ color: '#B9B9B9', fontWeight: '100' }}>{createDefaultTitle(model)}</span>);
  }

  render = () => {
    const orgTimezone = this.props.organisationModel.get('timezone', 'UTC');
    return (
      <div>
        <header id="topbar">
          <div className="heading heading-light">
            <span className="pull-right open_panel_btn" >
              <button
                className="btn btn-primary btn-sm"
                ref={(ref) => { this.addButton = ref; }}
                onClick={this.onClickAdd}>
                <i className="ion ion-plus" /> Add new
              </button>
            </span>
            <span className="pull-right open_panel_btn">
              <SearchBox schema={schema} />
            </span>
            Visualise
          </div>
        </header>
        <div className="row">
          <div className="col-md-12">
            <VisualisationList
              id={this.props.visualisationId}
              filter={queryStringToQuery(this.props.searchString, schema)}
              ModelForm={VisualiseForm}
              buttons={[PrivacyToggleButton, CopyButton, DeleteButton]}
              orgTimezone={orgTimezone}
              getDescription={model => (
                <span>
                  <span style={{ paddingRight: 10 }}>
                    <VisualiseIcon
                      type={model.get('type')}
                      sourceView={false} />
                  </span>
                  {this.populateTitle(model)}
                </span>
              )} />
          </div>
        </div>
      </div>
    );
  };
}

export default compose(
  connect(state => ({
    userId: loggedInUserId(state),
    searchString: modelQueryStringSelector(schema)(state),
    visualisationId:
      routeNodeSelector('organisation.data.visualise.visualisation')(state)
        .route
        .params
        .visualisationId,
    organisationModel: activeOrgSelector(state),
  }), { addModel })
)(Visualise);
