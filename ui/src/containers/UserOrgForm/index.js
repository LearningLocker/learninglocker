import React, { PropTypes } from 'react';
import { Map, List, fromJS } from 'immutable';
import uuid from 'uuid';
import { compose, setPropTypes, withProps, withHandlers } from 'recompose';
import { withSchema, withModel } from 'ui/utils/hocs';
import QueryBuilder from 'ui/containers/QueryBuilder';
import UserForm from 'ui/containers/UserForm';
import activeOrgSelector from 'ui/redux/modules/activeOrgSelector';
import Checkbox from 'ui/components/Material/Checkbox';
import { TimezoneSelector } from 'ui/components/TimezoneSelector';
import update$dteTimezone from 'ui/utils/queries/update$dteTimezone';
import { connect } from 'react-redux';
import { getAppDataSelector } from 'ui/redux/modules/app';
import { currentScopesSelector } from 'ui/redux/modules/auth';
import { SITE_ADMIN, SITE_CAN_CREATE_ORG, SITE_SCOPES } from 'lib/constants/scopes';

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
    timezone: organisationModel.get('timezone', 'UTC'),
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
  const settings = model.get(ORG_SETTINGS).find(val =>
    val.get('organisation').toString() === org
  );
  return settings || getDefaultOrgSettings(organisationModel);
};

const enhance = compose(
  setPropTypes({
    id: PropTypes.string.isRequired,
  }),
  connect(state => ({
    organisationModel: activeOrgSelector(state),
    activeScopes: currentScopesSelector(state),
    RESTRICT_CREATE_ORGANISATION: getAppDataSelector('RESTRICT_CREATE_ORGANISATION')(state)
  })),
  withProps({
    schema: 'user',
  }),
  withModel,
  withProps(({ model, organisationModel, updateModel }) =>
    ({
      /**
       * @params {{ attr: string, value: any }[]} attrValueList
       */
      updateOrgSettings: (attrValueList) => {
        const org = organisationModel.get('_id').toString();
        const hasExistingSetting = model.get(ORG_SETTINGS).find(orgSettings =>
          orgSettings.get('organisation').toString() === org
        );

        let allOrgSettings;
        if (hasExistingSetting) {
          allOrgSettings = model.get(ORG_SETTINGS).map((val) => {
            if (val.get('organisation').toString() === org) {
              return attrValueList.reduce((acc, { attr, value }) => acc.set(attr, value), val);
            }
            return val;
          });
        } else {
          allOrgSettings = model.get(ORG_SETTINGS) || new List();
          allOrgSettings = allOrgSettings.push(
            attrValueList.reduce(
              (acc, { attr, value }) => acc.set(attr, value),
              getDefaultOrgSettings(organisationModel)
            )
          );
        }

        updateModel({ path: [ORG_SETTINGS], value: allOrgSettings.toList() });
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
        );
        updateOrgSettings([{ attr: 'roles', value: newRoles.toList() }]);
      },
    handleSiteRolesChange: ({ model, updateModel }) =>
      (role, checked) => {
        const scopes = model.get('scopes', new List()).toSet();
        const newScopes = checked ?
          scopes.add(role) :
          scopes.delete(role);
        updateModel({ path: 'scopes', value: newScopes.toList() });
      },
    handleFilterChange: ({ updateOrgSettings }) =>
      (filter) => {
        updateOrgSettings([{ attr: 'filter', value: filter }]);
      },
    handleTimezoneChange: ({ model, organisationModel, updateOrgSettings }) =>
      (timezone) => {
        const userOrgSettings = getActiveOrgSettings({ model, organisationModel });
        const filter = userOrgSettings.get('filter', new Map({}));
        const timezoneUpdatedFilter = update$dteTimezone(filter, timezone);

        updateOrgSettings([
          { attr: 'timezone', value: timezone },
          { attr: 'filter', value: timezoneUpdatedFilter },
        ]);
      }
  })
);

const UserOrgForm = (props) => {
  const {
    model, // user
    organisationModel,
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
  const canEditSiteRoles = RESTRICT_CREATE_ORGANISATION &&
    props.activeScopes.includes(SITE_ADMIN);

  return (
    <div>
      <UserForm {...props} />
      <div className="row">
        <div className="col-md-12" >
          <div className="form-group">
            <label htmlFor={rolesId}>Organisation Roles</label>
            <div id={rolesId}>
              <RolesList selectedRoles={roles} handleRolesChange={handleRolesChange} />
            </div>
          </div>
        </div>
      </div>


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
              value={userOrgSettings.get('timezone', 'UTC')}
              onChange={handleTimezoneChange} />
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
              timezone={userOrgSettings.get('timezone', 'UTC')}
              onChange={handleFilterChange} />
          </div>
        </div>
      </div>
    </div>

  );
};

export default enhance(UserOrgForm);
