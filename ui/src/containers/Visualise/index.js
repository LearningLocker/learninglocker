import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { routeNodeSelector } from 'redux-router5';
import { withProps, compose } from 'recompose';
import { Map, fromJS } from 'immutable';
import { queryStringToQuery, modelQueryStringSelector } from 'ui/redux/modules/search';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { withModels, withModel } from 'ui/utils/hocs';
import { addModel } from 'ui/redux/modules/models';
import { loggedInUserId } from 'ui/redux/modules/auth';
import SearchBox from 'ui/containers/SearchBox';
import ModelList from 'ui/containers/ModelList';
import VisualiseForm from 'ui/containers/VisualiseForm';
import DeleteButton from 'ui/containers/DeleteButton';
import PrivacyToggleButton from 'ui/containers/PrivacyToggleButton';
import VisualisationTypeIcon from './VisualisationTypeIcon';
import styles from './visualise.css';


const schema = 'visualisation';

const VisualisationList = compose(
  withProps({
    schema,
    sort: fromJS({ createdAt: -1, _id: -1 })
  }),
  withModels,
  withModel
)(ModelList);

class Visualise extends Component {
  static propTypes = {
    userId: PropTypes.string,
    addModel: PropTypes.func,
    searchString: PropTypes.string,
    visualisationId: PropTypes.string, // optional
  };

  state = {
    criteria: ''
  };

  onClickAdd = () => {
    this.addButton.blur();
    this.props.addModel({
      schema,
      props: new Map({
        owner: this.props.userId,
        isExpanded: true
      })
    });
  }

  render = () => (
    <div>
      <header id="topbar">
        <div className="heading heading-light">
          <span className="pull-right open_panel_btn">
            <button
              className="btn btn-primary btn-sm"
              ref={(ref) => { this.addButton = ref; }}
              onClick={this.onClickAdd}>
              <i className="ion ion-plus" /> Add new
            </button>
          </span>
          <span className="pull-right open_panel_btn" style={{ width: '25%' }}>
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
            buttons={[PrivacyToggleButton, DeleteButton]}
            getDescription={model => (
              <span>
                <span style={{ paddingRight: 5 }}>
                  <VisualisationTypeIcon id={model.get('_id')} />
                </span>
                { model.get('description') || '~ Unnamed Visualisation'}
              </span>
            )} />
        </div>
      </div>
    </div>
  );
}

export default compose(
  withStyles(styles),
  connect(state => ({
    userId: loggedInUserId(state),
    searchString: modelQueryStringSelector(schema)(state),
    visualisationId:
      routeNodeSelector('organisation.data.visualise.visualisation')(state)
        .route
        .params
        .visualisationId
  }), { addModel })
)(Visualise);
