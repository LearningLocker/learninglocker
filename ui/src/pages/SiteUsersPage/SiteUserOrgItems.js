import React from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { compose, setPropTypes, withProps } from 'recompose';
import { withModels } from 'ui/utils/hocs';
import SiteUserOrgItem from './SiteUserOrgItem';

const enhance = compose(
  setPropTypes({
    user: PropTypes.instanceOf(Map).isRequired
  }),
  withProps(({ user }) => {
    const schema = 'organisation';
    const organisations = user.get('organisations').map(org => new Map({ $oid: org }));
    // Decision made via (https://github.com/LearningLocker/learninglocker/pull/1513#issuecomment-587064642)
    // Need to change when we will have OrganisationUser model.
    const filter = new Map({
      _id: new Map({
        $in: organisations.slice(0, 10)
      })
    });

    return { schema, filter };
  }),
  withModels
);

const SiteUserOrgItems = ({ models, user, filter }) => {
  // Decision made via (https://github.com/LearningLocker/learninglocker/pull/1513#issuecomment-587064642)
  // Need to change when we will have OrganisationUser model.
  const orgItems = filter
    .get('_id')
    .get('$in')
    .map((org) => {
      const orgModel = models.find(model =>
        model.get('_id').toString() === org.get('$oid').toString()
      );

      if (orgModel === undefined) {
        return (
          <li key={org.get('$oid').toString()}>
            Sorry organisation with id {org.get('$oid')} was deleted!
          </li>
        );
      }

      return <SiteUserOrgItem key={orgModel.get('_id').toString()} org={orgModel} user={user} />;
    })
    .valueSeq();

  const countOfRemainingOrganisations = user.get('organisations').count() - orgItems.count();

  return (
    <div>
      <ul>{orgItems}</ul>
      {countOfRemainingOrganisations > 0 && <p>Plus { countOfRemainingOrganisations } more not displayed</p>}
    </div>
  );
};

export default enhance(SiteUserOrgItems);
