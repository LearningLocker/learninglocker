import React from 'react';
import boolean from 'boolean';
import { fromJS, List, Map } from 'immutable';
import { connect } from 'react-redux';
import { slice, toPath } from 'lodash';
import classNames from 'classnames';
import { compose, withHandlers, withProps } from 'recompose';
import DebounceInput from 'react-debounce-input';
import uuid from 'uuid';
import styled from 'styled-components';
import { update$dteTimezone } from 'lib/helpers/update$dteTimezone';
import { ANYWHERE, NOWHERE, VALID_DOMAINS } from 'lib/constants/sharingScopes';
import QueryBuilder from 'ui/containers/QueryBuilder';
import { withModel } from 'ui/utils/hocs';
import ModelList from 'ui/containers/ModelList';
import ModelListItemWithoutModel from 'ui/containers/ModelListItem/ModelListItemWithoutModel';
import DeleteButtonComponent from 'ui/containers/DeleteButton';
import { updateModel as reduxUpdateModel } from 'ui/redux/modules/models';
import activeOrgSelector from 'ui/redux/modules/activeOrgSelector';
import { getShareableUrl } from 'ui/utils/dashboard';
import RadioGroup from 'ui/components/Material/RadioGroup';
import RadioButton from 'ui/components/Material/RadioButton';
import { ANY, JWT_SECURED, OFF } from 'lib/constants/dashboard';
import ValidationList from 'ui/components/ValidationList';
import { buildDefaultOptionLabel, TimezoneSelector } from 'ui/components/TimezoneSelector';
import OpenLinkButtonComponent from './OpenLinkButton';

const ContextHelp = styled.span`
  font-style: italic;
`;

const schema = 'dashboard';

const utilHandlers = withHandlers({
  updateSelectedSharable: ({
    parentModel,
    model,
    updateModel,
  }) => (pathValues) => {
    const newModel = pathValues.reduce((acc, { path, value }) => acc.set(path, value), model);
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
    updateSelectedSharable([{
      path: 'title',
      value,
    }]);
  },
  handleFilterChange: ({
    updateSelectedSharable
  }) => (filter) => {
    updateSelectedSharable([{
      path: 'filter',
      value: filter
    }]);
  },
  handleVisibilityChange: ({
    updateSelectedSharable
  }) => (value) => {
    updateSelectedSharable([{
      path: 'visibility',
      value
    }]);
  },
  handleDomainsChange: ({
    updateSelectedSharable
  }) => (event) => {
    updateSelectedSharable([{
      path: 'validDomains',
      value: event.target.value
    }]);
  },

  handleFilterModeChange: ({ updateSelectedSharable }) => (value) => {
    updateSelectedSharable([{
      path: 'filterMode',
      value
    }]);
  },
  handleFilterJwtSecretChange: ({ updateSelectedSharable }) => (event) => {
    updateSelectedSharable([{
      path: 'filterJwtSecret',
      value: event.target.value
    }]);
  },
  handleFilterRequiredChange: ({ updateSelectedSharable }) => (value) => {
    updateSelectedSharable([{
      path: 'filterRequired',
      value: boolean(value)
    }]);
  },
  onChangeTimezone: ({ model, organisationModel, updateSelectedSharable }) => (value) => {
    const timezone = value || organisationModel.get('timezone');

    const filter = model.get('filter', new Map({}));
    const timezoneUpdated = update$dteTimezone(filter, timezone);

    updateSelectedSharable([
      {
        path: 'filter',
        value: timezoneUpdated,
      },
      {
        path: 'timezone',
        value
      }
    ]);
  },

  copyToClipBoard: () => urlId => () => {
    window.document.getElementById(urlId).select();
    window.document.execCommand('copy');
  }
});

// Errors are set on the parent model
const getErrors = (parentModel, model) => {
  const messages = parentModel.getIn(['errors', 'messages'], new Map());

  const relevantMessages = messages
    .map((value, key) => {
      const id = parentModel
        .getIn(slice(toPath(key), 0, 2), new Map())
        .get('_id');

      if (!id) {
        return new List([]);
      }

      if (id === model.get('_id')) {
        return new List([new Map({ key: toPath(key)[2], value })]);
      }
    })
    .toList()
    .flatten(true);

  return relevantMessages
    .toMap()
    .mapKeys((key, value) => value.get('key'));
};

const ModelFormComponent = ({
  handleTitleChange,
  handleFilterChange,
  handleVisibilityChange,
  handleDomainsChange,

  handleFilterModeChange,
  handleFilterJwtSecretChange,
  handleFilterRequiredChange,
  onChangeTimezone,

  model,
  organisationModel,
  parentModel,
  copyToClipBoard,
}) => {
  const titleId = uuid.v4();
  const filterId = uuid.v4();
  const urlId = uuid.v4();
  const visibilityId = uuid.v4();
  const validDomainsId = uuid.v4();
  const filterModeId = uuid.v4();
  const filterRequiredId = uuid.v4();
  const filterJwtSecretId = uuid.v4();
  const filterTzId = uuid.v4();
  const filterMode = model.get('filterMode', OFF);
  const filterRequired = model.get('filterRequired', false);

  const errors = getErrors(parentModel, model);

  const orgTimezone = organisationModel.get('timezone', 'UTC');

  return (
    <div>
      <div className="form-group">
        <label htmlFor={titleId}>Title</label>
        <input
          className="form-control"
          id={titleId}
          value={model.get('title', '')}
          onChange={handleTitleChange} />
      </div>
      <div className="form-group">
        <label htmlFor={urlId}>Shareable link</label>
        <input
          id={urlId}
          style={{ backgroundColor: '#ccc' }}
          className={'form-control'}
          value={getShareableUrl({
            model,
            parentModel
          })}
          onChange={() => null} />
      </div>
      <div className="form-group">
        <button
          className="btn btn-primary"
          onClick={copyToClipBoard(urlId)}>
          Copy link
        </button>
        <ion-icon name="clipboard" />
      </div>

      <hr />

      <h4>Security</h4>

      <div className="form-group" style={{ marginTop: 25, marginBottom: 25 }}>
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

      {
        model.get('visibility') === VALID_DOMAINS
          ? (
            <div className="form-group" style={{ marginBottom: 25 }}>
              <label htmlFor={validDomainsId}>
                What are the valid domains?
              </label>
              <div>
                <DebounceInput
                  id={validDomainsId}
                  className="form-control"
                  debounceTimeout={377}
                  value={model.get('validDomains', '')}
                  onChange={handleDomainsChange} />
              </div>
              <ContextHelp className={'help-block'}>
                A <a href="https://regexr.com/" target="_blank" rel="noopener noreferrer">regex pattern</a> matching any
                hostname this dashboard will be embedded into
              </ContextHelp>
            </div>
          )
          : null
      }

      <div className="form-group" style={{ marginBottom: 25 }}>
        <label htmlFor={filterModeId}>
          URL filter mode
        </label>
        <RadioGroup
          id={filterModeId}
          name="filterMode"
          value={filterMode}
          onChange={handleFilterModeChange}>

          <RadioButton label="Disabled" value={OFF} />
          <RadioButton label="Plaintext" value={ANY} />
          <RadioButton label="JWT Secured" value={JWT_SECURED} />
        </RadioGroup>

        {
          filterMode === ANY
            ? (
              <ContextHelp className={'help-block'}>
                The JSON filter should be passed via the URL in a query parameter named filter. Some complex filters may
                need to be stripped of whitespace and URL Encoded first
              </ContextHelp>
            )
            : null
        }

        {
          filterMode === JWT_SECURED
            ? (
              <ContextHelp className={'help-block'}>
                The JSON filter should be encoded as a&nbsp;
                <a href="https://jwt.io/" target="_blank" rel="noopener noreferrer">JWT</a>
                &nbsp;and passed via the URL in a query parameter named filter
              </ContextHelp>
            )
            : null
        }
      </div>

      {
        filterMode === JWT_SECURED
          ? (
            <div
              className={classNames({
                'form-group': true,
                'has-error': errors.has('filterJwtSecret')
              })}
              style={{ marginBottom: 25 }}>
              <label htmlFor={filterJwtSecretId}>
                JWT Secret (HS256)
              </label>
              <ContextHelp className={'help-block'}>
                When the secured filter is enabled, the filter value must be a&nbsp;
                <a href="https://jwt.io/" target="_blank" rel="noopener noreferrer">valid JWT</a>
                &nbsp;signed with the following secret
              </ContextHelp>
              <input
                id={filterJwtSecretId}
                className="form-control"
                type="text"
                onChange={handleFilterJwtSecretChange}
                value={model.get('filterJwtSecret', '')} />
              {
                errors.get('filterJwtSecret')
                  ? (
                    <span className="help-block">
                      <ValidationList errors={fromJS([errors.get('filterJwtSecret')])} />
                    </span>
                  )
                  : null
              }
            </div>
          )
          : null
      }

      {
        filterMode === JWT_SECURED
          ? (
            <div className="form-group" style={{ marginBottom: 25 }}>
              <label htmlFor={filterJwtSecretId}>
                URL filter required
              </label>
              <ContextHelp className={'help-block'}>
                Must a filter be passed to the URL for the dashboard to load data?
              </ContextHelp>
              <RadioGroup
                id={filterRequiredId}
                name="filterRequired"
                value={filterRequired ? '1' : '0'}
                onChange={handleFilterRequiredChange}>

                <RadioButton label="Yes" value={'1'} />
                <RadioButton label="No" value={'0'} />
              </RadioGroup>
            </div>
          )
          : null
      }

      <hr />

      <div className="form-group">
        <h4>Base filter</h4>
        <ContextHelp className={'help-block'}>
          Configure a filter for this dashboard which will always be applied. The dashboard below will show a live
          preview of the result, updating as you construct your filter<br /><br />If a URL filter is also used, it will
          be applied on top of this filter
        </ContextHelp>

        <label htmlFor={filterTzId}>Timezone</label>
        <TimezoneSelector
          id={filterTzId}
          value={model.get('timezone', null)}
          onChange={onChangeTimezone}
          defaultOption={{
            label: buildDefaultOptionLabel(orgTimezone),
            value: orgTimezone,
          }} />

        <QueryBuilder
          id={filterId}
          timezone={model.get('timezone', null)}
          orgTimezone={orgTimezone}
          query={model.get('filter', new Map({}))}
          componentPath={new List([])}
          onChange={handleFilterChange} />
      </div>
    </div>
  );
};
/*

*/
const ModelForm = compose(
  connect(state => (
    { organisationModel: activeOrgSelector(state) }
  )),
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
      title: 'Shareable',
      createdAt: new Date(),
      timezone: null,
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
      <div
        className={'clearfix'}
        style={{ marginBottom: 20 }} >
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
  dashboardSharingHandlers
)(DashboardSharingComponent);
