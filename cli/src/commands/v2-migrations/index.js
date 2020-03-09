import { OrderedMap } from 'immutable';

import commonIndexesMigration from './20171122100800_common_indexes';
import updateRefs from './20171121153300_update_refs';
import expiration from './20180212_expiration';
import migrateIdentifiers from './20171127214900_migrate_identifiers';
import personasIndexes from './20171008104700_personas_indexes';
import siteSettings from './20180411160000_site_settings';
import shareableDashboards from './20180320093000_shareable_dashboards';
import personaAttributesIndexes from './20190212150000_personaAttributes_indexes';
import oauthTokens from './20190131000000_oauth_tokens';
import migrateToInQueries from './20190307130000_migrate_to_in_queries';
import migrateResetTokens from './20190509000000_migrate_null_resetTokens';
import fixTypoLast1Years from './20190627000000_fix_typo_last_1_years';
import personaImports from './20190711090000_persona_imports';
import migrateVizTypesOfTemplates from './20190719000000_migrate_viz_types_of_templates';
import renameCuratrVisTplTypesToStream from './20200227000000_rename_curatr_vis_tpl_types_to_stream';
import renameCuratrDashboardsToStream from './20200228000000_rename_curatr_dashboards_to_stream';

export default new OrderedMap()
  .set('20171122100800_common_indexes', commonIndexesMigration)
  .set('20171121153300_update_refs', updateRefs)
  .set('20171008104700_personas_indexes', personasIndexes)
  .set('20171127214900_migrate_identifiers', migrateIdentifiers)
  .set('20180320093000_shareable_dashboards', shareableDashboards)
  .set('20180411160000_site_settings', siteSettings)
  .set('20180212_expiration', expiration)
  .set('20190131000000_oauth_tokens', oauthTokens)
  .set('20190212150000_personaAttributes_indexes', personaAttributesIndexes)
  .set('20190307130000_migrate_to_in_queries', migrateToInQueries)
  .set('20190509000000_migrate_null_resetTokens', migrateResetTokens)
  .set('20190711090000_persona_imports', personaImports)
  .set('20190627000000_fix_typo_last_1_years', fixTypoLast1Years)
  .set('20190719000000_migrate_viz_types_of_templates', migrateVizTypesOfTemplates)
  .set('20200227000000_rename_curatr_vis_tpl_types_to_stream', renameCuratrVisTplTypesToStream)
  .set('20200228000000_rename_curatr_dashboards_to_stream', renameCuratrDashboardsToStream);
