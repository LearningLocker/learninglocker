import React, { PropTypes } from 'react';
import { compose, setPropTypes, withProps, withHandlers } from 'recompose';
import { List, Set } from 'immutable';
import {
  chain,
  map,
  groupBy,
  startCase,
  lowerCase,
  difference,
} from 'lodash';
import Checkbox from 'ui/components/Material/Checkbox';
import { withModel } from 'ui/utils/hocs';
import orgScopes, {
  roleGroupNames,
} from 'lib/constants/orgScopes';
import {
  getScopeDependencies,
  getScopeDependents,
} from 'lib/helpers/scopes';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import styles from './styles.css';


export const generateNewScopes = (oldScopes, scope, checked) => {
  let newScopes;
  if (checked) {
    const scopeDependencies = getScopeDependencies()(scope);
    newScopes = oldScopes.union(new Set([scope, ...scopeDependencies]));
  } else {
    let newScopesAll;

    const dependencies = getScopeDependencies()(scope);
    if (
      difference(dependencies, oldScopes.toJS()).length === 0
    ) {
      const dependenciesDependents = chain(dependencies)
        .map(getScopeDependents())
        .flatten();

      newScopesAll = oldScopes.subtract(new Set([
        ...dependencies,
        ...dependenciesDependents
      ]));
    } else {
      newScopesAll = oldScopes;
    }

    const scopeDependents = getScopeDependents()(scope);
    newScopes = newScopesAll.subtract(
      new Set([
        scope,
        ...scopeDependents,
      ])
    );
  }

  return newScopes.toList();
};

const enhance = compose(
  setPropTypes({
    id: PropTypes.string.isRequired,
  }),
  withProps({
    schema: 'role',
  }),
  withModel,
  withStyles(styles),
  withHandlers({
    handleAttrChange: ({ updateModel }) =>
      (attr, { target: { value } }) => {
        updateModel({ path: [attr], value });
      },
    handleScopeChange: ({ model, updateModel }) =>
      (scope, checked) => {
        const oldScopes = model.get('scopes', new List()).toSet();

        const newScopes = generateNewScopes(oldScopes, scope, checked);

        updateModel({ path: ['scopes'], value: newScopes });
      }
  })
);

export const groupScopes = (scopes = orgScopes) => {
  const groupedOrgScopes = groupBy(scopes, item =>
    [...item.split('/').slice(0, -1)].join('/')
  );

  return groupedOrgScopes;
};

const isChecked = (key, model) =>
  model.get('scopes', new List()).includes(key);

export const getRowLabel = key => roleGroupNames[key];

export const getLabel = (key) => {
  const key2 = key.split('/').slice(-1)[0];

  switch (key2) {
    case 'view':
      return 'View';
    case 'edit' :
      return 'Edit';
    default:
      return startCase(lowerCase(key2));
  }
};

const renderScopeTableRow = ({
  key,
  scopes,
  handleScopeChange,
  model
}) =>
  (<tr key={`${key}_td`}>
    <td key={`${key}_td`}>{getRowLabel(key)}</td>
    {map(scopes, scope =>
      (<td key={`${scope}_td`} colSpan={(scopes.length === 1 ? 2 : 1)}>
        <Checkbox
          key={scope}
          label={getLabel(scope)}
          checked={isChecked(scope, model)}
          onChange={handleScopeChange.bind(null, scope)} />
      </td>)
    )}
  </tr>);

const render = ({ model, handleAttrChange, handleScopeChange }) => {
  const groupedOrgScopes = groupScopes(orgScopes);

  return (
    <div>
      <div className="form-group">
        <label htmlFor={`${model.get('_id')}nameInput`}>Title</label>
        <input
          id={`${model.get('_id')}nameInput`}
          className="form-control"
          placeholder="A name for this Role"
          value={model.get('title')}
          onChange={handleAttrChange.bind(null, 'title')} />
      </div>
      <div className="form-group">
        <label htmlFor={`${model.get('_id')}descriptionInput`}>Description</label>
        <input
          id={`${model.get('_id')}descriptionInput`}
          className="form-control"
          placeholder="A short description for this Role"
          value={model.get('description')}
          onChange={handleAttrChange.bind(null, 'description')} />
      </div>
      <div className="form-group">
        <label htmlFor={`${model.get('_id')}scopes`}>Organisation Scopes</label>
        <div id={`${model.get('_id')}scopes`}>
          <table
            className={styles.table} ><tbody>{
            map(groupedOrgScopes, (scopes, key) =>
              (renderScopeTableRow({
                scopes,
                key,
                handleScopeChange,
                model
              }))
            )
          }</tbody></table>
        </div>
      </div>
    </div>
  );
};

export default enhance(render);
