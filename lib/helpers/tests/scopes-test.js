import { expect } from 'chai';
import { getScopeDependencies, getScopeDependents } from 'lib/helpers/scopes';

import { ALL } from 'lib/constants/scopes';
import {
  EDIT_ALL_VISUALISATIONS,
  VIEW_ALL_VISUALISATIONS,
  EDIT_PUBLIC_VISUALISATIONS,
  VIEW_PUBLIC_VISUALISATIONS,
} from 'lib/constants/orgScopes';

describe('scopes helper', () => {
  it('should have dependencies for EDIT_ALL_VISUALISATIONS', () => {
    const result = getScopeDependencies()(EDIT_ALL_VISUALISATIONS);

    expect(
      result
    ).to.have.members([
      VIEW_ALL_VISUALISATIONS,
      EDIT_PUBLIC_VISUALISATIONS,
      VIEW_PUBLIC_VISUALISATIONS,
    ]);
  });

  it('should have dependents for EDIT_ALL_VISUALISATIONS', () => {
    const result = getScopeDependents()(EDIT_ALL_VISUALISATIONS);

    expect(
      result
    ).to.have.members([
      ALL
    ]);
  });
});
