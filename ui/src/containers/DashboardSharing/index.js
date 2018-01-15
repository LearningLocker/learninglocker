import React from 'react';
import { Map, List } from 'immutable';
import { Card } from 'react-toolbox/lib/card';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import {
  compose,
  withProps,
  withState,
  withHandlers
} from 'recompose';
import QueryBuilder from 'ui/containers/QueryBuilder';
import { withModel } from 'ui/utils/hocs';
import uuid from 'uuid';
import styles from './styles.css';

const schema = 'dashboard';

const selectedShareableState = withState('selectedShareable', 'setSelectedShareable');

const utilHandlers = withHandlers({
  updateSelectedSharable: ({
    shareable,
    selectedShareable,
    updateModel,
    setSelectedShareable
  }) => ({
    path,
    value,
  }) => {
    const newSelectedShareable = selectedShareable.set(path, value);
    setSelectedShareable(newSelectedShareable);

    const selectedIndex = shareable.findIndex(item => item.get('_id') === selectedShareable.get('_id'));

    const newShareable = shareable.set(selectedIndex, newSelectedShareable);
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

const DashboardSharingComponent = ({
  shareable,
  selectedShareable,
  addShareable,
  setSelectedShareable,
  handleTitleChange,
  handleFilterChange
}) => {
  const filterId = uuid.v4();
  const titleId = uuid.v4();

  return (<Card className={styles.sharingCard}>
    <div className="row">
      <div className="col-md-6">
        Dashboard Sharing
        {shareable.map(share2 =>
          (<div onClick={() => setSelectedShareable(share2)}>
            {share2.get('title', '~ Shareable')}
          </div>)
        )}

        <button
          className="btn btn-primary"
          onClick={addShareable}>
          New shareable link
        </button>
      </div>
      <div className="col-md-6">
        {selectedShareable && (<div className="form-group">
          <div>
            <label htmlFor={titleId}>Title</label>
            <input
              id={titleId}
              value={selectedShareable.get('title')}
              onChange={handleTitleChange} />
          </div>
          <div>
            <label htmlFor={filterId}>Filter</label>
            <QueryBuilder
              id={filterId}
              query={selectedShareable.get('filter', new Map({}))}
              componentPath={new List([])}
              onChange={handleFilterChange} />
          </div>
        </div>)}
      </div>
    </div>
  </Card>);
};

export default compose(
  withProps(({ id }) => ({
    id,
    schema
  })),
  withModel,
  withProps(({ model }) =>
    ({
      shareable: model.get('shareable')
    })
  ),
  withStyles(styles),
  selectedShareableState,
  utilHandlers,
  handlers
)(DashboardSharingComponent);
