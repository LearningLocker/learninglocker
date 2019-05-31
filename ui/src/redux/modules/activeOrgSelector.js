import { createSelector } from 'reselect';
import { modelsSchemaIdSelector } from 'ui/redux/selectors';
import { activeOrgIdSelector } from 'ui/redux/modules/router';

const activeOrgSelector = createSelector(
  [state => state, activeOrgIdSelector],
  (state, activeOrgId) =>
    modelsSchemaIdSelector('organisation', activeOrgId)(state),
);

export default activeOrgSelector;
