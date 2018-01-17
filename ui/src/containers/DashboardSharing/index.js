import React from 'react';
import { Map, List } from 'immutable';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import {
  compose,
  withProps,
  withHandlers
} from 'recompose';
import QueryBuilder from 'ui/containers/QueryBuilder';
import { withModel } from 'ui/utils/hocs';
import uuid from 'uuid';
import ModelList from 'ui/containers/ModelList';
import ModelListItemWithoutModel from 'ui/containers/ModelListItem/ModelListItemWithoutModel';
import DeleteButtonComponent from 'ui/containers/DeleteButton';
import { updateModel as reduxUpdateModel } from 'ui/redux/modules/models';
import styles from './styles.css';

const schema = 'dashboard';

const utilHandlers = withHandlers({
  updateSelectedSharable: ({
    parentModel,
    model,
    updateModel,
  }) => ({
    path,
    value,
  }) => {
    const newModel = model.set(path, value);
    const selectedIndex = parentModel.get('shareable').findIndex(item => item.get('_id') === parentModel.get('_id'));

    const newShareable = parentModel.get('shareable').set(selectedIndex, newModel);
    updateModel({
      path: 'shareable',
      value: newShareable
    });
  },
});

const handlers = withHandlers({
  handleTitleChange: ({
    updateSelectedSharable
  }) => (event) => {
    const value = event.target.value;
    updateSelectedSharable({
      path: 'title',
      value,
    });
  },
  handleFilterChange: ({
    updateSelectedSharable
  }) => (filter) => {
    updateSelectedSharable({
      path: 'filter',
      value: filter
    });
  }
});

const ModelFormComponent = ({
  handleTitleChange,
  handleFilterChange,
  model
}) => {
  const titleId = uuid.v4();
  const filterId = uuid.v4();

  return (<div>
    <div>
      <label htmlFor={titleId}>Title</label>
      <input
        id={titleId}
        value={model.get('title')}
        onChange={handleTitleChange} />
    </div>
    <div>
      <label htmlFor={filterId}>Filter</label>
      <QueryBuilder
        id={filterId}
        query={model.get('filter', new Map({}))}
        componentPath={new List([])}
        onChange={handleFilterChange} />
    </div>
  </div>);
};

const ModelForm = compose(
  utilHandlers,
  handlers
)(ModelFormComponent);

const deleteButton = ({ parentModel }) => compose(
  connect(() => ({}), { updateModel: reduxUpdateModel }),
  withHandlers({
    onDelete: ({ updateModel }) => ({ id }) => {
      const newShareable = parentModel.get('shareable').filter(mod => mod.get('_id') !== id);
      updateModel({
        schema,
        id: parentModel.get('_id'),
        path: 'shareable',
        value: newShareable
      });
    }
  })
)(DeleteButtonComponent);

// --------------------------

const dashboardSharingHandlers = withHandlers({
  addShareable: ({ updateModel, model }) => () => {
    const newShareable = model.get('shareable', new List()).push(new Map({
      title: '~ Shareable'
    }));
    updateModel({
      path: 'shareable',
      value: newShareable
    });
  }
});

const DashboardSharingComponent = ({
  model,
  updateModel,
  addShareable
}) =>
  (
    <div>
      <div className={`clearfix ${styles.shareableHeader}`}>
        <button
          className="btn btn-primary pull-right"
          onClick={addShareable}>
          Add new link
        </button>
      </div>
      <ModelList
        ModelForm={ModelForm}
        getDescription={mod => mod.get('title')}
        models={model.get('shareable')}
        ModelListItem={ModelListItemWithoutModel}
        parentModel={model}
        updateModel={updateModel}
        buttons={[(deleteButton({ parentModel: model }))]} />
    </div>
  );

export default compose(
  withProps(({ id }) => ({
    id,
    schema
  })),
  withModel,
  withStyles(styles),
  dashboardSharingHandlers
)(DashboardSharingComponent);
