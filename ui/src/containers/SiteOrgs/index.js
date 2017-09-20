import React from 'react';
import { fromJS } from 'immutable';
import { connect } from 'react-redux';
import { withProps, compose, withHandlers } from 'recompose';
import {
  queryStringToQuery,
  modelQueryStringSelector
} from 'ui/redux/modules/search';
import SearchBox from 'ui/containers/SearchBox';
import { withModels } from 'ui/utils/hocs';
import SiteOrgItem from 'ui/containers/SiteOrgs/SiteOrgItem';
import { addModel as addModelAction } from 'ui/redux/modules/models';
import { loggedInUserSelector } from 'ui/redux/modules/auth';
import ModelList from 'ui/containers/ModelList';
import DeleteButton from 'ui/containers/DeleteButton';
import OrgMemberButton from 'ui/containers/OrgMemberButton';

const schema = 'organisation';
const OrgList = compose(
  withProps({
    schema,
    sort: fromJS({ name: 1, _id: -1 })
  }),
  withModels
)(ModelList);

const enhance = compose(
  connect(
    state => ({
      searchString: modelQueryStringSelector(schema)(state),
      authUser: loggedInUserSelector(state)
    }),
    { addModel: addModelAction }
  ),
  withHandlers({
    handleAdd: ({ addModel, authUser }) => () => {
      addModel({
        schema: 'organisation',
        props: {
          owner: authUser.get('_id')
        }
      });
    }
  })
);

const render = ({ params, searchString, handleAdd }) => (
  <div>
    <header id="topbar">
      <div className="heading heading-light">
        All Organisations
        <span className="pull-right open_panel_btn">
          <button className="btn btn-primary btn-sm" onClick={handleAdd}>
            <i className="ion ion-plus" /> Add new
          </button>
        </span>
        <span className="pull-right open_panel_btn" style={{ width: '25%' }}>
          <SearchBox schema={schema} />
        </span>
      </div>
    </header>

    <div className="row">
      <div className="col-md-12">
        <OrgList
          filter={queryStringToQuery(searchString, schema)}
          params={params}
          getDescription={model => model.get('name')}
          buttons={[OrgMemberButton, DeleteButton]}
          ModelForm={SiteOrgItem} />
      </div>
    </div>
  </div>
);

export default enhance(render);
