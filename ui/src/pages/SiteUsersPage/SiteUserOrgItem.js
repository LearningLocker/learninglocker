import React from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import SiteOrgLink from './SiteOrgLink';

/**
 * @param {{
 *  org: Map;
 *  user: Map;
 * }} props
 */
function SiteUserOrgItem(props) {
  const isOwnerOrg = props.org.get('_id') === props.user.get('ownerOrganisation');
  const style = {
    fontWeight: isOwnerOrg ? 'bold' : 'normal'
  };
  return (
    <li key={props.org.get('_id')}>
      <SiteOrgLink model={props.org} style={style} />
    </li>
  );
}

SiteUserOrgItem.propTypes = {
  org: PropTypes.instanceOf(Map).isRequired,
  user: PropTypes.instanceOf(Map).isRequired,
};

export default React.memo(SiteUserOrgItem);
