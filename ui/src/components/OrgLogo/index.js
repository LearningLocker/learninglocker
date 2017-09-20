import React from 'react';
import DEFAULT_LOGO from 'ui/static/logos/default/default.gif';

const getLogoSrc = (organisation) => {
  const orgId = organisation.get('_id');
  const updatedAt = organisation.getIn(['logo', 'updatedAt']);
  return `/api/downloadlogo/${orgId}?t=${updatedAt}`;
};

const getSrc = organisation =>
  (organisation.has('logo') ? getLogoSrc(organisation) : DEFAULT_LOGO);

export default ({ organisation, style = {} }) =>
  <img
    role="presentation"
    style={style}
    alt="logo"
    src={getSrc(organisation)} />;
