import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fromJS } from 'immutable';
import { withProps, compose } from 'recompose';
import { withModels } from 'ui/utils/hocs';
import UserPicture from 'ui/components/UserPicture';
import { queryStringToQuery, modelQueryStringSelector } from 'ui/redux/modules/search';
import SearchBox from 'ui/containers/SearchBox';
import SiteUserItem from 'ui/containers/SiteUsers/SiteUserItem';
import { expandModel } from 'ui/redux/modules/models';
import ModelList from 'ui/containers/ModelList';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import styles from 'ui/containers/Users/users.css';

const schema = 'user';
const UserList = compose(
  withProps({
    schema,
    sort: fromJS({ email: 1, _id: -1 })
  }),
  withModels
)(ModelList);

class SiteUsers extends Component {
  static propTypes = {
    // expandModel: PropTypes.func,
  }

  componentDidMount = () => {
    // if (this.props.params.userId) {
    //   this.props.expandModel(schema, this.props.params.userId, true);
    // }
  }

  renderUserDescription = (model) => {
    const name = model.get('name', model.get('email'));

    return (
      <span>
        <UserPicture model={model} className="pull-left" />
        {name}
        {model.has('googleId') && <i className={`ion ion-social-googleplus ${styles.marginLeft}`} />}
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
            filter={queryStringToQuery(this.props.searchString, schema)}
            getDescription={this.renderUserDescription}
            ModelForm={SiteUserItem} />
        </div>
      </div>
    </div>
  );
}

export default compose(
  withStyles(styles),
  connect(
    state => ({
      searchString: modelQueryStringSelector(schema)(state),
    }),
    { expandModel }
  )
)(SiteUsers);
