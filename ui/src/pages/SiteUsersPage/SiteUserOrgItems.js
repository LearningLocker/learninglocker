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

const SiteUserOrgItems = ({ models, user, fetchMore, hasMore }) => {
  const orgsItems = models
    .map(org => <SiteUserOrgItem key={org.get('_id').toString()} org={org} user={user} />)
    .valueSeq();

  return (
    <div>
      <ul>{orgsItems}</ul>
      {
        hasMore
          ? <button
            className={'btn btn-default btn-sm'}
            onClick={fetchMore}>
            Load more
          </button>
          : null
      }
    </div>
  );
};

export default enhance(SiteUserOrgItems);
