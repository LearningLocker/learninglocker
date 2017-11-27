import { OrderedMap } from 'immutable';
import migratePersonas from './20171127214500_migrate_personas';
import migrateIdentifiers from './20171127214900_migrate_identifiers';

export default new OrderedMap()
  .set('20171127214500_migrate_personas', migratePersonas)
  .set('20171127214900_migrate_identifiers', migrateIdentifiers);
