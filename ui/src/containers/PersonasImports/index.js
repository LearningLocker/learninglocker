import React from 'react';
import { connect } from 'react-redux';
import { withProps, compose, withHandlers } from 'recompose';
import { fromJS } from 'immutable';
import { withModels } from 'ui/utils/hocs';
import ModelList from 'ui/containers/ModelList';
import { addModel } from 'ui/redux/modules/models';
import { loggedInUserId } from 'ui/redux/modules/auth';
import PersonasImportForm from './PersonasImportForm';

const schema = 'personasImport';

const ImportList = compose(
  withProps({
    schema,
    sort: fromJS({ createdAt: -1, _id: -1 })
  }),
  withModels
)(ModelList);

const onAddModel = ({ addModel: doAddModel, userId }) => () => {
  doAddModel({
    schema,
    props: {
      owner: userId,
      isExpanded: true
    }
  });
};

const handlers = withHandlers({
  onAddModel
});

const personaImports = ({
  onAddModel: doOnAddModel
}) => {
  return (
    <div>
      <header id="topbar">
        <div className="heading heading-light">
          <span className="pull-right open_panel_btn">
            <button
              className="btn btn-primary btn-sm"
              onClick={doOnAddModel} >
              <i className="ion ion-plus" /> Import
            </button>
          </span>
          &nbsp;People - Imports
        </div>
      </header>
      <div className="row">
        <div className="col-md-12">
          <ImportList
            filter={({})}
            ModelForm={PersonasImportForm}
            getDescription={model => model.get('title', '~ Unnamed Import')} />
        </div>
      </div>
    </div>
  );
};

export default compose(
  connect(
    state => ({
      userId: loggedInUserId(state),
    }),
    { addModel }
  ),
  handlers
)(personaImports);
