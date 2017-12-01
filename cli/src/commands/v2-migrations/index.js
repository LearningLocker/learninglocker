import { OrderedMap } from 'immutable';
import commonIndexesMigration from './20171122100800_common_indexes';
import updateRefs from './20171121153300_update_refs';
// import removeUnusedPersonaProps from './20171127214500_remove_unused_persona_props';
import migrateIdentifiers from './20171127214900_migrate_identifiers';
// import removeOldIdents from './20171128144900_remove_old_idents';

export default new OrderedMap()
  .set('20171122100800_common_indexes', commonIndexesMigration)
  .set('20171121153300_update_refs', updateRefs)
  // .set('20171127214500_remove_unused_persona_props', removeUnusedPersonaProps)
  .set('20171127214900_migrate_identifiers', migrateIdentifiers);
  // .set('20171128144900_remove_old_idents', removeOldIdents)
