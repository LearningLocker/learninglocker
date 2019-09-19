import React from 'react';
import { connect } from 'react-redux';
import { withProps, compose, withHandlers } from 'recompose';
import { fromJS, Map } from 'immutable';
import { withModels } from 'ui/utils/hocs';
import ModelList from 'ui/containers/ModelList';
import { addModel } from 'ui/redux/modules/models';
import { loggedInUserId } from 'ui/redux/modules/auth';
import DeleteButton from 'ui/containers/DeleteButton';
import { STAGE_PROCESSING } from 'lib/constants/personasImport';
import PersonasImportForm from './PersonasImportForm';

const schema = 'personasImport';

const deleteButtonWithDisabled = models => ({ id, ...props }) => {
  const disabled = models.getIn([id, 'importStage']) === STAGE_PROCESSING;

  return (<DeleteButton
    id={id}
    disabled={disabled}
    {...props} />);
};

const ImportList = compose(
  withProps({
    schema,
    sort: fromJS({
      createdAt: -1,
      _id: -1
    }),
  }),
  withModels,
  withProps(({ models }) => ({
    buttons: [deleteButtonWithDisabled(models)]
  }))
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

export const PersonasImportsComponent = ({
  onAddModel: doOnAddModel
}) =>
  (
    <div>
      <header id="topbar">
        <div className="heading heading-light">
          <span className="pull-right open_panel_btn">
            <button
              className="btn btn-primary btn-sm"
              onClick={doOnAddModel} >
              <i className="ion ion-plus" />Import
            </button>
          </span>
          People - Imports
        </div>
      </header>
      <div className="row">
        <div className="col-md-12">
          <ImportList
            filter={new Map()}
            ModelForm={PersonasImportForm}
            getDescription={model => model.get('title', 'Unnamed Import')} />
        </div>
      </div>
    </div>
  );

export default compose(
  connect(
    state => ({
      userId: loggedInUserId(state),
    }),
    { addModel }
  ),
  handlers
)(PersonasImportsComponent);
