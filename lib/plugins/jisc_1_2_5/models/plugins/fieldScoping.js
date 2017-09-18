import _ from 'lodash';
import { CLIENT_SCOPES } from 'lib/constants/scopes';

export default function fieldScoping(schema) {
  schema.statics.getAllowedFieldsByScope = function filterFieldsByScope(scopes) {
    const allowedFields = _.keys(_.pickBy(schema.paths, (path) => {
      // pass fields always visible
      if (_.get(path, 'options.alwaysReadable', false)) {
        return true;
      }
      const readAccess = _.get(path, 'options.readAccess', [scopes.ALL]);
      return _.intersection(readAccess, scopes).length > 0;
    }));

    return allowedFields;
  };

  schema.path('_id').options.readAccess = _.keys(CLIENT_SCOPES);
  schema.path('CREATED_AT').options.readAccess = _.keys(CLIENT_SCOPES);
  schema.path('UPDATED_AT').options.readAccess = _.keys(CLIENT_SCOPES);
}
