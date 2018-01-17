import React from 'react';
import { Map, List } from 'immutable';
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
  addShareable: ({ updateModel, shareable }) => () => {
    const newShareable = shareable.push(new Map({}));
    updateModel({
      path: 'shareable',
      value: newShareable
    });
  },
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

const DashboardSharingComponent = ({
  model,
  updateModel
}) =>
  (<ModelList
    ModelForm={ModelForm}
    getDescription={mod => mod.get('title')}
    models={model.get('shareable')}
    ModelListItem={ModelListItemWithoutModel}
    parentModel={model}
    updateModel={updateModel} />);

export default compose(
  withProps(({ id }) => ({
    id,
    schema
  })),
  withModel,
  withStyles(styles),
)(DashboardSharingComponent);
