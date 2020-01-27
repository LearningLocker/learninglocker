import React from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { compose, withProps, setPropTypes } from 'recompose';
import { withModels } from 'ui/utils/hocs';
import SiteUserOrgItem from './SiteUserOrgItem';

const enhance = compose(
  setPropTypes({
    user: PropTypes.instanceOf(Map).isRequired
  }),
  withProps(({ user }) => {
    const schema = 'organisation';
    const filter = new Map({
      owner: user.get('_id')
    });

    return { schema, filter };
  }),
  withModels
);

const SiteUserOrgItems = ({ models, user }) => {
  const orgsItems = models
    .map(org => <SiteUserOrgItem key={org.get('_id').toString()} org={org} user={user} />)
    .valueSeq();
  return <ul>{orgsItems}</ul>;
};

export default enhance(SiteUserOrgItems);
