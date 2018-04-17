import React, { PropTypes } from 'react';
import { Map, List, fromJS } from 'immutable';
import uuid from 'uuid';
import { compose, setPropTypes, withProps, withHandlers } from 'recompose';
import { withSchema, withModel } from 'ui/utils/hocs';
import QueryBuilder from 'ui/containers/QueryBuilder';
import UserForm from 'ui/containers/UserForm';
import { activeOrgIdSelector } from 'ui/redux/modules/router';
import Checkbox from 'ui/components/Material/Checkbox';
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
            label={model.get('title') || '~ Unnamed Role'}
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
            label={model.get('title') || '~ Unnamed Role'}
            checked={isChecked}
            onChange={handleRolesChange.bind(null, modelId)} />
        );
      }).valueSeq()
    }
  </div>);
});

const getDefaultOrgSettings = organisation =>
  fromJS({
    organisation,
    scopes: [],
    filter: {},
  });

const getActiveOrgSettings = ({ model, organisationId }) => {
  // @TODO: org isn't available and when it is, it doesnt retrigger this
  const org = organisationId.toString();
  const settings = model.get(ORG_SETTINGS).find(val =>
    val.get('organisation').toString() === org
  );
  return settings || getDefaultOrgSettings(organisationId);
};

const enhance = compose(
  setPropTypes({
    id: PropTypes.string.isRequired,
  }),
  connect(state => ({
    organisationId: activeOrgIdSelector(state),
    activeScopes: currentScopesSelector(state),
    RESTRICT_CREATE_ORGANISATION: getAppDataSelector('RESTRICT_CREATE_ORGANISATION')(state)
  })),
  withProps({
    schema: 'user',
  }),
  withModel,
  withProps(({ model, organisationId, updateModel }) =>
    ({
      updateOrgSettings: (attr, value) => {
        const org = organisationId.toString();
        const hasExistingSetting = model.get(ORG_SETTINGS).find(orgSettings =>
          orgSettings.get('organisation').toString() === org
        );

        let allOrgSettings;
        if (hasExistingSetting) {
          allOrgSettings = model.get(ORG_SETTINGS).map((val) => {
            if (val.get('organisation').toString() === org) {
              return val.set(attr, value);
            }
            return val;
          });
        } else {
          allOrgSettings = model.get(ORG_SETTINGS) || new List();
          allOrgSettings = allOrgSettings.push(
            getDefaultOrgSettings(organisationId).set(attr, value)
          );
        }

        updateModel({ path: [ORG_SETTINGS], value: allOrgSettings.toList() });
      },
    })
  ),
  withHandlers({
    handleRolesChange: ({ model, organisationId, updateOrgSettings }) =>
      (role, checked) => {
        const userOrgSettings = getActiveOrgSettings({ model, organisationId });
        const rolesSet = userOrgSettings.get('roles', new List()).toSet();
        const newRoles = (
          checked ?
          rolesSet.add(role) :
          rolesSet.delete(role)
        );
        updateOrgSettings('roles', newRoles.toList());
      },
    handleSiteRolesChange: ({ model, updateModel }) => (role, checked) => {
      const scopes = model.get('scopes', new List()).toSet();
      const newScopes = checked ?
        scopes.add(role) :
        scopes.delete(role);
      updateModel({ path: 'scopes', value: newScopes.toList() });
    },
    handleFilterChange: ({ updateOrgSettings }) =>
      (filter) => {
        updateOrgSettings('filter', filter);
      }
  })
);

const render = (props) => {
  const {
    model,
    organisationId,
    handleRolesChange,
    handleFilterChange,
    handleSiteRolesChange,
    RESTRICT_CREATE_ORGANISATION
  } = props;
  const userOrgSettings = getActiveOrgSettings({ model, organisationId });
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

      <div className="form-group">
        <label htmlFor={filterId}>User Filter</label>
        <QueryBuilder
          id={filterId}
          componentPath={new List([
            'user',
            model.get('_id'),
          ])}
          query={filter}
          onChange={handleFilterChange} />
      </div>
    </div>
  );
};

export default enhance(render);
