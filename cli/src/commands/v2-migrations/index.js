import { OrderedMap } from 'immutable';
import commonIndexesMigration from './20171122100800_common_indexes';
import updateRefs from './20171121153300_update_refs';

export default new OrderedMap()
  .set('20171122100800_common_indexes', commonIndexesMigration)
  .set('20171121153300_update_refs', updateRefs);
