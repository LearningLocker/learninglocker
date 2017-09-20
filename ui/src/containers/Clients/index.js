import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { fromJS } from 'immutable';
import { withProps, compose } from 'recompose';
import { queryStringToQuery, modelQueryStringSelector } from 'ui/redux/modules/search';
import { withModels } from 'ui/utils/hocs';
import { addModel } from 'ui/redux/modules/models';
import { loggedInUserId } from 'ui/redux/modules/auth';
import getRouteUrl from 'ui/utils/getRouteUrl';
import SearchBox from 'ui/containers/SearchBox';
import ModelList from 'ui/containers/ModelList';
import ClientForm from 'ui/containers/ClientForm';

const schema = 'client';
const ClientList = compose(
  withProps({
    schema,
    sort: fromJS({ createdAt: -1, _id: -1 })
  }),
  withModels
)(ModelList);

class Clients extends Component {

  static propTypes = {
    userId: PropTypes.string,
    addModel: PropTypes.func,
    searchString: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      criteria: ''
    };
  }

  onClickAdd = () => {
    this.addButton.blur();
    this.props.addModel({
      schema,
      props: {
        owner: this.props.userId,
        isExpanded: true
      }
    });
  }

  render = () => {
    const xAPIEndpoint = `${getRouteUrl()}/data/xAPI`;
    return (
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
            Clients
          </div>
        </header>
        <div className="row">
          <div className="col-md-12">
            <div className="alert alert-warning">
              <strong>xAPI Endpoint:</strong> <a href={xAPIEndpoint}>{ xAPIEndpoint }</a>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <ClientList
              filter={queryStringToQuery(this.props.searchString, schema)}
              ModelForm={ClientForm}
              getDescription={model => model.get('title')} />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(state => ({
  userId: loggedInUserId(state),
  searchString: modelQueryStringSelector(schema)(state),
}), { addModel })(Clients);

