import React, { PropTypes } from 'react';
import { Map } from 'immutable';
import { compose, withProps, setPropTypes } from 'recompose';
import { withModels } from 'ui/utils/hocs';
import SiteUserOrgItem from 'ui/containers/SiteUsers/SiteUserOrgItem';

const enhance = compose(
  setPropTypes({
    user: PropTypes.instanceOf(Map).isRequired
  }),
  withProps(({ user }) => {
    const schema = 'organisation';
    const organisations = user
      .get('organisations')
      .map(org => new Map({ $oid: org }));
    const filter = new Map({
      _id: new Map({
        $in: organisations
      })
    });

    return { schema, filter };
  }),
  withModels
);

const render = ({ models, user }) => {
  const orgsItems = models
    .map(org => <SiteUserOrgItem org={org} user={user} />)
    .valueSeq();
  return <ul>{orgsItems}</ul>;
};

export default enhance(render);
