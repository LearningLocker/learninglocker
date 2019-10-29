import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fromJS } from 'immutable';
import { withProps, compose } from 'recompose';
import { withModels, withModel } from 'ui/utils/hocs';
import UserPicture from 'ui/components/UserPicture';
import { queryStringToQuery, modelQueryStringSelector } from 'ui/redux/modules/search';
import SearchBox from 'ui/containers/SearchBox';
import { expandModel } from 'ui/redux/modules/models';
import ModelList from 'ui/containers/ModelList';
import { routeNodeSelector } from 'redux-router5';
import SiteUserItem from './SiteUserItem';

const schema = 'user';
const UserList = compose(
  withProps({
    schema,
    sort: fromJS({ email: 1, _id: -1 })
  }),
  withModels,
  withModel
)(ModelList);

class SiteUsers extends Component {
  renderUserDescription = (model) => {
    const name = model.get('name', model.get('email'));

    return (
      <span>
        <UserPicture model={model} className="pull-left" />
        {name}
        {model.has('googleId') && (
          <i
            className="ion ion-social-googleplus"
            style={{ marginLeft: '1em', fontWeight: 'bold' }} />
        )}
      </span>
    );
  }

  render = () => (
    <div>
      <header id="topbar">
        <div className="heading heading-light">
          All Users
          <span className="pull-right open_panel_btn" style={{ width: '25%' }}>
            <SearchBox schema={schema} />
          </span>
        </div>
      </header>

      <div className="row">
        <div className="col-md-12">
          <UserList
            id={this.props.userId}
            filter={queryStringToQuery(this.props.searchString, schema)}
            getDescription={this.renderUserDescription}
            ModelForm={SiteUserItem} />
        </div>
      </div>
    </div>
  );
}

export default connect(
  state => ({
    searchString: modelQueryStringSelector(schema)(state),
    userId: routeNodeSelector('admin.users.id')(state).route.params.userId
  }),
  { expandModel }
)(SiteUsers);
