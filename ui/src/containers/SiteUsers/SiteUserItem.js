import React, { PropTypes } from 'react';
import { compose, withProps, withHandlers, setPropTypes } from 'recompose';
import { withModel } from 'ui/utils/hocs';
import UserForm from 'ui/containers/UserForm';
import { SITE_SCOPES } from 'lib/constants/scopes';
import Checkbox from 'ui/components/Material/Checkbox';
import SiteUserOrgItems from 'ui/containers/SiteUsers/SiteUserOrgItems';
import map from 'lodash/map';
import uuid from 'uuid';

const enhance = compose(
  setPropTypes({
    id: PropTypes.string.isRequired
  }),
  withProps({
    schema: 'user'
  }),
  withModel,
  withHandlers({
    onChangeScopes: ({ model, updateModel }) => (scope, checked) => {
      const scopesSet = model.get('scopes').toSet();
      const newScopes = checked
        ? scopesSet.add(scope)
        : scopesSet.delete(scope);
      updateModel({
        path: ['scopes'],
        value: newScopes.toList()
      });
    }
  })
);

const render = ({ onChangeScopes, model }) => {
  const scopes = model.get('scopes');
  const siteScopesId = uuid.v4();

  return (
    <div>
      <UserForm model={model} />
      <div className="row">
        <div className="col-md-12">
          <div className="form-group">
            <label htmlFor={siteScopesId}>Site Scopes</label>
            <div id={siteScopesId}>
              {map(SITE_SCOPES, (name, scope) => {
                const isChecked = scopes.includes(scope);
                return (
                  <Checkbox
                    key={scope}
                    label={name}
                    checked={isChecked}
                    onChange={onChangeScopes.bind(null, scope)} />
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <hr />
      <h4>Organisations</h4>
      <SiteUserOrgItems user={model} />
    </div>
  );
};

export default enhance(render);
