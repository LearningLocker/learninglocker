import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { fromJS } from 'immutable';
import { withProps, compose, setPropTypes, withHandlers } from 'recompose';
import { queryStringToQuery, modelQueryStringSelector } from 'ui/redux/modules/search';
import { withModels, withModel } from 'ui/utils/hocs';
import { addModel } from 'ui/redux/modules/models';
import { clearModelsCache } from 'ui/redux/modules/pagination';
import RoleForm from 'ui/containers/RoleForm';
import SearchBox from 'ui/containers/SearchBox';
import ModelList from 'ui/containers/ModelList';
import DeleteButton from 'ui/containers/DeleteButton';

// @todo Need to check that no users are using the role before it can be deleted
const RoleDeleteButton = compose(
  withModel,
)(DeleteButton);

const schema = 'role';

const RoleList = compose(
  withProps({
    schema,
    sort: fromJS({ updatedAt: 1, _id: -1 })
  }),
  withModels
)(ModelList);

const enhance = compose(
  connect(
    state => ({ searchString: modelQueryStringSelector(schema)(state) }),
    { addModel, clearModelsCache }
  ),
  setPropTypes({
    searchString: PropTypes.string,
  }),
  withHandlers({
    handleAddClick: ({ userId, addModel: createModel, clearModelsCache: clearCache }) =>
      async () => {
        try {
          await createModel({
            schema,
            props: {
              owner: userId,
            }
          });
          clearCache({ schema });
        } catch (err) {
          console.error(err);
        }
      }
  })
);

export const buttonFilter = (buttons, models) =>
  (models.size === 1 ? [] : buttons);

const render = ({ searchString, handleAddClick }) =>
  (
    <div>
      <header id="topbar">
        <div className="heading heading-light">
          <span className="pull-right open_panel_btn">
            <button
              className="btn btn-primary btn-sm"
              onClick={handleAddClick}>
              <i className="ion ion-plus" /> Add new
            </button>
          </span>
          <span className="pull-right open_panel_btn" style={{ width: '25%' }}>
            <SearchBox schema={schema} />
          </span>
            Roles
        </div>
      </header>
      <div className="row">
        <div className="col-md-12">
          <RoleList
            filter={queryStringToQuery(searchString, schema)}
            ModelForm={RoleForm}
            buttons={[RoleDeleteButton]}
            modifyButtons={buttonFilter}
            getDescription={model =>
              model.get('title') || '~ Unnamed Role'
            } />
        </div>
      </div>
    </div>
  );

export default enhance(render);
