import * as scopes from 'lib/constants/scopes';
import get from 'lodash/get';
import includes from 'lodash/includes';
import hasIn from 'lodash/hasIn';
import intersection from 'lodash/intersection';

export const runScopeChecks = (model, type, req, res, next) => {
  const authInfo = req.user.authInfo || {};
  const modelScopes = get(model.schema, type, []); // by default allow nothing if val isn't present

  let actualScopes = [];
  if (authInfo.token) {
    if (includes(authInfo.token.scopes, scopes.SITE_ADMIN)) {
      // if we are a site admin, allow all
      return next();
    }
  }

  if (authInfo.client) {
    // there is no user, so use scopes on client
    actualScopes = authInfo.client.scopes;
  } else if (hasIn(authInfo, 'token.scopes')) {
    // then we should be looking to the active organisation's scopes (if present)
    actualScopes = authInfo.token.scopes;
  }

  if (intersection(modelScopes, actualScopes).length > 0) {
    return next();
  }
  return res.status(403).send('Priviliges not sufficient for this operation');
};

export default function scopeChecks(schema) {
  schema.statics.readScopeChecks = function runReadScopeChecks(req, res, next) {
    const model = this;
    return runScopeChecks(model, 'readScopes', req, res, next);
  };

  schema.statics.writeScopeChecks = function runWriteScopeChecks(req, res, next) {
    const model = this;
    return runScopeChecks(model, 'writeScopes', req, res, next);
  };
}
