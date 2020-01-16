import React from 'react';
import PropTypes from 'prop-types';
import Link from 'ui/containers/Link';
import { Map } from 'immutable';

/**
 * @param {{
 *  model: Map;
 *  style: object;
 * }} props
 */
function OrganisationLink(props) {
  return (
    <Link
      style={props.style}
      routeName="admin.organisations.id"
      routeParams={{ organisationId: props.model.get('_id') }}>
      {props.model.get('name')}
    </Link>
  );
}

OrganisationLink.propTypes = {
  model: PropTypes.instanceOf(Map),
  style: PropTypes.object,
};

export default React.memo(OrganisationLink);
