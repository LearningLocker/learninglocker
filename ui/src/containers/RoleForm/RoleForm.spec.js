import { Set } from 'immutable';
import { ALL } from 'lib/constants/scopes';
import scopes, {
  EDIT_ALL_VISUALISATIONS,
  VIEW_ALL_VISUALISATIONS,
  EDIT_PUBLIC_VISUALISATIONS,
  VIEW_PUBLIC_VISUALISATIONS,
} from 'lib/constants/orgScopes';
import { groupScopes, generateNewScopes } from './index.js';

describe('RoleForm', () => {
  it('Should group roles', () => {
    const result = groupScopes();
    expect(result[''][0]).toEqual('all');
    expect(result['org/all/statementForwarding'][0]).toEqual('org/all/statementForwarding/view');
  });

  it('Should remove dependent permissions', () => {
    const result = generateNewScopes(new Set([
      EDIT_PUBLIC_VISUALISATIONS,
      VIEW_PUBLIC_VISUALISATIONS,
    ]), EDIT_PUBLIC_VISUALISATIONS, false);

    expect(result.size).toEqual(0);
  });

  it('Should remove dependencies if all dependencies are checked and the dependencies dependents', () => {
    const result = generateNewScopes(new Set([
      EDIT_ALL_VISUALISATIONS,
      VIEW_ALL_VISUALISATIONS,
      EDIT_PUBLIC_VISUALISATIONS,
      VIEW_PUBLIC_VISUALISATIONS,
    ]), EDIT_PUBLIC_VISUALISATIONS, false);

    expect(result.size).toEqual(0);
  });

  it('Should not remove dependencies if only some dependencies are checked', () => {
    const result = generateNewScopes(new Set(
      scopes
    ), EDIT_PUBLIC_VISUALISATIONS, false).toSet();


    const intersectSize = result.intersect(new Set([
      ALL,
      EDIT_ALL_VISUALISATIONS,
      VIEW_ALL_VISUALISATIONS,
      EDIT_PUBLIC_VISUALISATIONS,
      VIEW_PUBLIC_VISUALISATIONS
    ])).size;
    expect(intersectSize).toEqual(0);

    const result2 = generateNewScopes(
      result.toSet(),
      EDIT_PUBLIC_VISUALISATIONS, false
    ).toSet();

    expect(result2.size).toEqual(result.size);
  });

  it('selecting a checkbox should select all its dependencies', () => {
    const result = generateNewScopes(new Set(), EDIT_PUBLIC_VISUALISATIONS, true);

    expect(result.size).toEqual(2);
    expect(result.toSet().subtract(new Set([
      EDIT_PUBLIC_VISUALISATIONS,
      VIEW_PUBLIC_VISUALISATIONS
    ])).size).toEqual(0);
  });
});
