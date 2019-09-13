import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Map, List, fromJS } from 'immutable';
import uuid from 'uuid';
import { compose, setPropTypes, withProps, withHandlers } from 'recompose';
import { SITE_ADMIN, SITE_CAN_CREATE_ORG, SITE_SCOPES, ALL } from 'lib/constants/scopes';
import { MANAGE_ALL_USERS } from 'lib/constants/orgScopes';
import { update$dteTimezone } from 'lib/helpers/update$dteTimezone';
import { withSchema, withModel } from 'ui/utils/hocs';
import QueryBuilder from 'ui/containers/QueryBuilder';
import UserForm from 'ui/containers/UserForm';
import activeOrgSelector from 'ui/redux/modules/activeOrgSelector';
import Checkbox from 'ui/components/Material/Checkbox';
import { TimezoneSelector, buildDefaultOptionLabel } from 'ui/components/TimezoneSelector';
import { getAppDataSelector } from 'ui/redux/modules/app';
import { currentScopesSelector } from 'ui/redux/modules/auth';
import { updateUserOrganisationSetting } from 'ui/redux/actions';

const ORG_SETTINGS = 'organisationSettings';

const RolesList = compose(
  setPropTypes({
    selectedRoles: PropTypes.instanceOf(List).isRequired,
    handleRolesChange: PropTypes.func.isRequired,
  }),
  withProps({
    sort: new Map({
      title: 1,
      _id: 1,
    }),
    filter: new Map({}),
  }),
  withSchema('role'),
)(({ models, selectedRoles, handleRolesChange }) =>
  (<div>
    {
      models.map((model) => {
        const modelId = model.get('_id');
        const isChecked = selectedRoles.includes(modelId);
        return (
          <Checkbox
            key={modelId}
            label={model.get('title') || 'Unnamed Role'}
            checked={isChecked}
            onChange={handleRolesChange.bind(null, modelId)} />
        );
      }).valueSeq()
    }
  </div>)
);

const SiteRolesList = compose(
  setPropTypes({
    selectedRoles: PropTypes.instanceOf(List).isRequired,
    handleRolesChange: PropTypes.func.isRequired,
  }),
  withProps({
    sort: new Map({
      title: 1,
      _id: 1,
    }),
    filter: new Map({}),
  }),
)(({ selectedRoles, handleRolesChange }) => {
  const models = new List([
    new Map({
      _id: SITE_CAN_CREATE_ORG,
      title: SITE_SCOPES[SITE_CAN_CREATE_ORG]
    })
  ]);
  return (<div>
    {
      models.map((model) => {
        const modelId = model.get('_id');
        const isChecked = selectedRoles.includes(modelId);
        return (
          <Checkbox
            key={modelId}
            label={model.get('title') || 'Unnamed Role'}
            checked={isChecked}
            onChange={handleRolesChange.bind(null, modelId)} />
        );
      }).valueSeq()
    }
  </div>);
});

/**
 * @param {immutable.Map} organisationModel - organisation
 * @returns {immutable.Map}
 */
const getDefaultOrgSettings = organisationModel =>
  fromJS({
    organisation: organisationModel.get('_id'),
    scopes: [],
    filter: {},
    timezone: null,
  });

/**
 * @param {object} - {
 *                     model: immutable.Map // user
 *                     organisationModel: immutable.Map
 *                   }
 * @returns {immutable.Map}
 */
const getActiveOrgSettings = ({ model, organisationModel }) => {
  // @TODO: org isn't available and when it is, it doesnt retrigger this
  const org = organisationModel.get('_id').toString();
  const settings = model.get(ORG_SETTINGS, new List()).find(val =>
    val.get('organisation').toString() === org
  );
  return settings || getDefaultOrgSettings(organisationModel);
};

const enhance = compose(
  setPropTypes({
    id: PropTypes.string.isRequired,
  }),
  connect(
    state => ({
      organisationModel: activeOrgSelector(state),
      activeScopes: currentScopesSelector(state),
      RESTRICT_CREATE_ORGANISATION: getAppDataSelector('RESTRICT_CREATE_ORGANISATION')(state)
    }),
    dispatch => ({
      dispatchUpdateUserOrganisationSetting: args => dispatch(updateUserOrganisationSetting(args)),
    }),
  ),
  withProps({
    schema: 'user',
  }),
  withModel,
  withProps(({ model, organisationModel, dispatchUpdateUserOrganisationSetting }) =>
    ({
      /**
       * @params {{ attr: string, value: any }[]} attrValueList
       */
      updateOrgSettings: (values) => {
        const organisationId = organisationModel.get('_id').toString();
        const userId = model.get('_id').toString();
        dispatchUpdateUserOrganisationSetting({ userId, organisationId, values });
      },
    })
  ),
  withHandlers({
    handleRolesChange: ({ model, organisationModel, updateOrgSettings }) =>
      (role, checked) => {
        const userOrgSettings = getActiveOrgSettings({ model, organisationModel });
        const rolesSet = userOrgSettings.get('roles', new List()).toSet();
        const newRoles = (
          checked ?
          rolesSet.add(role) :
          rolesSet.delete(role)
        ).toList();
        updateOrgSettings({ roles: newRoles });
      },
    handleSiteRolesChange: ({ model, updateModel }) =>
      (role, checked) => {
        const scopesSet = model.get('scopes', new List()).toSet();
        const newScopes = (
          checked ?
          scopesSet.add(role) :
          scopesSet.delete(role)
        ).toList();
        updateModel({ path: 'scopes', value: newScopes });
      },
    handleFilterChange: ({ updateOrgSettings }) =>
      (filter) => {
        updateOrgSettings({ filter: JSON.stringify(filter) });
      },
    handleTimezoneChange: ({ model, organisationModel, updateOrgSettings }) =>
      (timezone) => {
        const userOrgSettings = getActiveOrgSettings({ model, organisationModel });
        const filter = userOrgSettings.get('filter', new Map({}));
        const orgTimezone = organisationModel.get('timezone') || 'UTC';

        const timezoneForFilter = timezone === null ? orgTimezone : timezone;
        const newFilter = update$dteTimezone(filter, timezoneForFilter);
        updateOrgSettings({
          timezone,
          filter: JSON.stringify(newFilter),
        });
      },
  })
);

const UserOrgForm = (props) => {
  const {
    model, // user
    organisationModel,
    activeScopes,
    handleRolesChange,
    handleFilterChange,
    handleSiteRolesChange,
    handleTimezoneChange,
    RESTRICT_CREATE_ORGANISATION
  } = props;
  const userOrgSettings = getActiveOrgSettings({ model, organisationModel });
  const roles = userOrgSettings.get('roles', new List());
  const rolesId = uuid.v4();
  const siteRolesId = uuid.v4();
  const filterId = uuid.v4();
  const filter = fromJS(userOrgSettings.get('filter', new Map({})));

  const siteRoles = model.get('scopes', new List());

  const canEditOrgRoles = activeScopes.some(s => [SITE_ADMIN, ALL, MANAGE_ALL_USERS].includes(s));
  const canEditSiteRoles = RESTRICT_CREATE_ORGANISATION && activeScopes.includes(SITE_ADMIN);
  const isSiteAdmin = activeScopes.includes(SITE_ADMIN);

  const orgTimezone = organisationModel.get('timezone') || 'UTC';

  return (
    <div>
      <UserForm {...props} />

      {canEditOrgRoles && <div className="row">
        <div className="col-md-12" >
          <div className="form-group">
            <label htmlFor={rolesId}>Organisation Roles</label>
            <div id={rolesId}>
              <RolesList selectedRoles={roles} handleRolesChange={handleRolesChange} />
            </div>
          </div>
        </div>
      </div>}


      {canEditSiteRoles && <div className="row">
        <div className="col-md-12">
          <div className="form-group">
            <label htmlFor={siteRolesId}>Site Roles</label>
            <div id={siteRolesId}>
              <SiteRolesList selectedRoles={siteRoles} handleRolesChange={handleSiteRolesChange} />
            </div>
          </div>
        </div>
      </div>}

      <div className="row">
        <div className="col-md-12">
          <div className="form-group">
            <label htmlFor={filterId}>User Filter Timezone</label>
            <TimezoneSelector
              id={filterId}
              disabled={!isSiteAdmin}
              value={userOrgSettings.get('timezone', null)}
              onChange={handleTimezoneChange}
              defaultOption={{
                label: buildDefaultOptionLabel(orgTimezone),
                value: orgTimezone,
              }} />
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          <div className="form-group">
            <label htmlFor={filterId}>User Filter</label>
            <QueryBuilder
              id={filterId}
              componentPath={new List([
                'user',
                model.get('_id'),
              ])}
              query={filter}
              timezone={userOrgSettings.get('timezone', null)}
              orgTimezone={orgTimezone}
              onChange={handleFilterChange} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default enhance(UserOrgForm);
