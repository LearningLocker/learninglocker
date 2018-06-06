import React from 'react';
import { Map, List } from 'immutable';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import {
  compose,
  withProps,
  withHandlers
} from 'recompose';
import DebounceInput from 'react-debounce-input';
import QueryBuilder from 'ui/containers/QueryBuilder';
import { withModel } from 'ui/utils/hocs';
import uuid from 'uuid';
import ModelList from 'ui/containers/ModelList';
import ModelListItemWithoutModel from 'ui/containers/ModelListItem/ModelListItemWithoutModel';
import DeleteButtonComponent from 'ui/containers/DeleteButton';
import { updateModel as reduxUpdateModel } from 'ui/redux/modules/models';
import { getShareableUrl } from 'ui/utils/dashboard';
import {
  NOWHERE,
  ANYWHERE,
  VALID_DOMAINS
} from 'lib/constants/sharingScopes';
import RadioGroup from 'ui/components/Material/RadioGroup';
import RadioButton from 'ui/components/Material/RadioButton';
import { OFF, ANY, JWT_SECURED } from 'lib/constants/dashboard';
import Switch from 'ui/components/Material/Switch';
import OpenLinkButtonComponent from './OpenLinkButton';
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
    const selectedIndex = parentModel.get('shareable').findIndex(item =>
      item.get('_id') === model.get('_id')
    );

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
  },
  handleVisibilityChange: ({
    updateSelectedSharable
  }) => (value) => {
    updateSelectedSharable({
      path: 'visibility',
      value
    });
  },
  handleDomainsChange: ({
    updateSelectedSharable
  }) => (event) => {
    updateSelectedSharable({
      path: 'validDomains',
      value: event.target.value
    });
  },

  handleFilterModeChange: ({ updateSelectedSharable }) => (value) => {
    updateSelectedSharable({
      path: 'filterMode',
      value
    });
  },
  handleFilterNotEmptyChange: ({ updateSelectedSharable }) => (value) => {
    updateSelectedSharable({
      path: 'filterNotEmpty',
      value
    });
  },
  handleFilterJwtSecretChange: ({ updateSelectedSharable }) => (event) => {
    updateSelectedSharable({
      path: 'filterJwtSecret',
      value: event.target.value
    });
  }
});

const ModelFormComponent = ({
  handleTitleChange,
  handleFilterChange,
  handleVisibilityChange,
  handleDomainsChange,

  handleFilterModeChange,
  handleFilterNotEmptyChange,
  handleFilterJwtSecretChange,

  model,
  parentModel
}) => {
  const titleId = uuid.v4();
  const filterId = uuid.v4();
  const urlId = uuid.v4();
  const visibilityId = uuid.v4();
  const validDomainsId = uuid.v4();
  const filterModeId = uuid.v4();
  const filterNotEmptyId = uuid.v4();
  const filterJwtSecretId = uuid.v4();

  return (<div>
    <div className="form-group">
      <label htmlFor={titleId}>Title</label>
      <input
        className="form-control"
        id={titleId}
        value={model.get('title')}
        onChange={handleTitleChange} />
    </div>
    <div className="form-group">
      <label htmlFor={urlId}>Shareable link</label>
      <input
        id={urlId}
        className="form-control"
        disabled="true"
        value={getShareableUrl({
          model,
          parentModel
        })} />
    </div>

    <div className="form-group">
      <label htmlFor={visibilityId}>
        Where can this be viewed?
      </label>
      <RadioGroup
        id={visibilityId}
        name="visibility"
        value={model.get('visibility')}
        onChange={handleVisibilityChange}>
        <RadioButton label="Nowhere" value={NOWHERE} />
        <RadioButton label="Anywhere" value={ANYWHERE} />
        <RadioButton
          label="Only where I choose"
          value={VALID_DOMAINS} />
      </RadioGroup>
    </div>

    {model.get('visibility') === VALID_DOMAINS &&
      <div className="form-group">
        <label htmlFor={validDomainsId}>
          What are the valid domains?
        </label>
        <div>
          <DebounceInput
            id={validDomainsId}
            className={styles.textField}
            debounceTimeout={377}
            value={model.get('validDomains')}
            onChange={handleDomainsChange} />
        </div>
      </div>}

    <div className="form-group">
      <label htmlFor={filterModeId}>
        Filter url paramater mode
      </label>
      <RadioGroup
        id={filterModeId}
        name="filterMode"
        value={model.get('filterMode', OFF)}
        onChange={handleFilterModeChange}>

        <RadioButton label="Off" value={OFF} />

        <RadioButton label="Any" value={ANY} />
        <RadioButton label="JWT Secured" value={JWT_SECURED} />
      </RadioGroup>
    </div>

    {model.get('filterMode', OFF) !== OFF &&
    <div className="form-group">
      <label htmlFor={filterNotEmptyId} >
        Parameter filter
      </label>

      <Switch
        id={filterNotEmptyId}
        label="Filter paramater required?"
        checked={model.get('fitlerNotEmpty', true)}
        onChange={handleFilterNotEmptyChange} />
      {model.get('filterMode', OFF) === JWT_SECURED &&
      <div>
        <label htmlFor={filterJwtSecretId} >
          JWT Secret
        </label>
        <input
          id={filterJwtSecretId}
          className="form-control"
          type="text"
          onChange={handleFilterJwtSecretChange}
          value={model.get('filterJwtSecret', '')} />
      </div>}
    </div>}


    <div className="form-group">
      <label htmlFor={filterId}>Filter</label>
      <QueryBuilder
        id={filterId}
        query={model.get('filter', new Map({}))}
        componentPath={new List([])}
        onChange={handleFilterChange} />
    </div>
  </div>);
};
/*

*/
const ModelForm = compose(
  utilHandlers,
  handlers,
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

const openLinkButton = ({ parentModel }) => compose(
  withHandlers({
    openLink: ({ id }) => () => {
      const model = parentModel.get('shareable').find(mod => mod.get('_id') === id);
      const url = getShareableUrl({ model, parentModel });
      window.open(url, `shareable-${parentModel.get('_id')}-${model.get('_id')}`);
    }
  })
)(OpenLinkButtonComponent);

// --------------------------

const dashboardSharingHandlers = withHandlers({
  addShareable: ({ updateModel, model }) => () => {
    const newShareable = model.get('shareable', new List()).push(new Map({
      title: '~ Shareable',
      createdAt: new Date(),
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
          New shareable link
        </button>
      </div>
      <ModelList
        schema="dashboardSharing"
        isLoading={false}
        hasMore={false}
        models={model.get('shareable', new List())}
        fetchMore={() => {}}
        ModelForm={ModelForm}
        ModelListItem={ModelListItemWithoutModel}
        parentModel={model}
        updateModel={updateModel}
        buttons={[(openLinkButton({ parentModel: model })), (deleteButton({ parentModel: model }))]}
        getDescription={mod => mod.get('title')}
        noItemsDisplay="No shared links - click 'New shareable link' to share your dashboard" />
      <hr />
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
