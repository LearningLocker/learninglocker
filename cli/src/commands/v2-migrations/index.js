import { OrderedMap } from 'immutable';
import migratePersonas from '20171127214500_migrate_personas';

export default new OrderedMap()
  .set('20171127214500_migrate_personas', migratePersonas);
