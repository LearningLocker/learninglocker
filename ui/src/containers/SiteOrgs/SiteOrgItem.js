import React, { PropTypes } from 'react';
import { fromJS } from 'immutable';
import Link from 'ui/containers/Link';
import { withProps, compose, setPropTypes } from 'recompose';
import { withModels } from 'ui/utils/hocs';
import SubOrgForm from 'ui/containers/SubOrgForm';

const SiteOrgUserList = compose(
  setPropTypes({
    organisation: PropTypes.string
  }),
  withProps(({ organisation }) => ({
    schema: 'user',
    filter: fromJS({
      organisations: {
        $oid: organisation
      }
    })
  })),
  withModels
)(({ models }) => (
  <ul>
    {models
      .map((user) => {
        const name = user.get('name');
        const display = !name || name === '' ? user.get('email') : name;

        return (
          <li key={user.get('_id')}>
            <Link
              routeName="admin.users.id"
              routeParams={{ userId: user.get('_id') }}>
              {display}
            </Link>
          </li>
        );
      })
      .valueSeq()}
  </ul>
));

const render = ({ model }) => (
  <div>
    <SubOrgForm model={model} />
    <h3 className="pageHeader">Users</h3>
    <SiteOrgUserList organisation={model.get('_id')} />
  </div>
);

export default render;
