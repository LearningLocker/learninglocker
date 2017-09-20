import React, { PropTypes } from 'react';
import { Map } from 'immutable';
import { setPropTypes } from 'recompose';
import SiteOrgLink from 'ui/components/Site/SiteOrgLink';

const enhance = setPropTypes({
  org: PropTypes.instanceOf(Map).isRequired,
  user: PropTypes.instanceOf(Map).isRequired
});

const render = ({ org, user }) => {
  const isOwnerOrg = org.get('_id') === user.get('ownerOrganisation');
  const style = {
    fontWeight: isOwnerOrg ? 'bold' : 'normal'
  };
  return (
    <li key={org.get('_id')}>
      <SiteOrgLink model={org} style={style} />
    </li>
  );
};

export default enhance(render);
