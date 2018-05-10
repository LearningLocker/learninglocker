import getJSONFromQuery from 'api/utils/getJSONFromQuery';
import catchErrors from 'api/controllers/utils/catchErrors';
import getPersonaFilter from 'api/controllers/utils/getPersonaFilter';
import getFromQuery from 'api/utils/getFromQuery';
import ClientError from 'lib/errors/ClientError';
import getOrgFromAuthInfo from 'lib/services/auth/authInfoSelectors/getOrgFromAuthInfo';
import getAuthFromRequest from 'lib/helpers/getAuthFromRequest';
import getScopeFilter from 'lib/services/auth/filters/getScopeFilter';
import { CursorDirection } from '@learninglocker/persona-service/dist/service/constants';
import { MAX_TIME_MS, MAX_SCAN } from 'lib/models/plugins/addCRUDFunctions';
import parseQuery from 'lib/helpers/parseQuery';
import updateQueryBuilderCache from 'lib/services/importPersonas/updateQueryBuilderCache';
import getPersonaService from 'lib/connections/personaService';
import {
  isUndefined,
  omitBy,
} from 'lodash';
import { entityResponse, entitiesResponse } from 'api/controllers/utils/entitiesResponse';

const MODEL_NAME = 'personaAttribute';

const personaService = getPersonaService();

const personaAttributeConnection = catchErrors(async (req, res) => {
  const { before, after } = req.query;

  const sort = getJSONFromQuery(req, 'sort', { _id: 1 });
  const hint = getJSONFromQuery(req, 'hint', undefined);
  const project = getJSONFromQuery(req, 'project', undefined);
  const first = getFromQuery(req, 'first', undefined, parseInt);
  const last = getFromQuery(req, 'last', undefined, parseInt);
  const authInfo = getAuthFromRequest(req);

  const scopeFilter = await getScopeFilter({
    modelName: MODEL_NAME,
    actionName: 'view',
    authInfo
  });

  const parsedFilter = await parseQuery(getJSONFromQuery(req, 'filter', {}));
  const {
    personaId,
    ...inFilter
  } = parsedFilter;

  const personaIdFilter = getPersonaFilter(personaId, 'personaId');

  const filter = {
    ...inFilter,
    ...personaIdFilter,
    ...scopeFilter
  };
  const filterNoUndefined = omitBy(filter, isUndefined);

  const result = await personaService.getAttributes({
    limit: first || last || 10,
    direction: CursorDirection[before ? 'BACKWARDS' : 'FORWARDS'],
    sort,
    cursor: after || before,
    organisation: getOrgFromAuthInfo(authInfo),
    filter: filterNoUndefined,
    project,
    hint,
    maxTimeMS: MAX_TIME_MS,
    maxScan: MAX_SCAN
  });

  return res.status(200).send(result);
});

const addPersonaAttribute = catchErrors(async (req, res) => {
  const authInfo = getAuthFromRequest(req);

  await getScopeFilter({
    modelName: MODEL_NAME,
    actionName: 'create',
    authInfo
  });

  const organisation = getOrgFromAuthInfo(authInfo);

  const { key, value, personaId } = req.body;
  if (!key || !personaId) {
    throw new ClientError('`key` and `personaId` must be included when creating an attribute');
  }
  if (value === undefined) {
    throw new ClientError('Value must be defined');
  }

  const { attribute } = await personaService.overwritePersonaAttribute({
    organisation,
    personaId,
    key,
    value,
  });

  updateQueryBuilderCache({
    attributes: [attribute],
    organisation,
  });

  return entityResponse(res, attribute);
});

const getPersonaAttribute = catchErrors(async (req, res) => {
  const authInfo = getAuthFromRequest(req);

  await getScopeFilter({
    modelName: MODEL_NAME,
    actionName: 'view',
    authInfo
  });

  const { attribute } = await personaService.getAttribute({
    organisation: getOrgFromAuthInfo(authInfo),
    id: req.params.personaAttributeId
  });

  return entityResponse(res, attribute);
});

const getPersonaAttributes = catchErrors(async (req, res) => {
  const authInfo = getAuthFromRequest(req);

  await getScopeFilter({
    modelName: MODEL_NAME,
    actionName: 'view',
    authInfo
  });

  const sort = getJSONFromQuery(req, 'sort', { _id: 1 });
  const limit = getFromQuery(req, 'limit', undefined, parseInt);
  const skip = getFromQuery(req, 'skip', undefined, parseInt);

  const query = getJSONFromQuery(req, 'query', {});
  const filter = getJSONFromQuery(req, 'filter', query);

  const {
    personaId,
    ...inFilter
  } = filter;

  const { attributes } = await personaService.getPersonaAttributes({
    sort,
    limit,
    skip,
    personaId,
    filter: inFilter,
    organisation: getOrgFromAuthInfo(authInfo),
  });

  return entitiesResponse(res, attributes);
});

const updatePersonaAttribute = catchErrors(async (req, res) => {
  const authInfo = getAuthFromRequest(req);

  await getScopeFilter({
    modelName: MODEL_NAME,
    actionName: 'edit',
    authInfo
  });

  const organisation = getOrgFromAuthInfo(authInfo);

  const { key, value, personaId } = req.body;
  if (!key || !personaId) {
    throw new ClientError('`key` and `personaId` must be included when updating an attribute');
  }
  if (value === undefined) {
    throw new ClientError('Value must be defined');
  }

  const { attribute } = await personaService.overwritePersonaAttribute({
    organisation,
    personaId,
    key,
    value,
  });

  updateQueryBuilderCache({
    attributes: [attribute],
    organisation,
  });

  return entityResponse(res, attribute);
});
const deletePersonaAttribute = catchErrors(async (req, res) => {
  const authInfo = getAuthFromRequest(req);

  await getScopeFilter({
    modelName: MODEL_NAME,
    actionName: 'delete',
    authInfo
  });

  await personaService.deletePersonaAttribute({
    organisation: getOrgFromAuthInfo(authInfo),
    id: req.params.personaAttributeId
  });

  return res.status(200).send();
});

const personaAttributeCount = catchErrors(async (req, res) => {
  const authInfo = getAuthFromRequest(req);

  const scopeFilter = await getScopeFilter({
    modelName: MODEL_NAME,
    actionName: 'view',
    authInfo
  });

  const userFilter = await parseQuery(req.query.query, {
    organisation: getOrgFromAuthInfo(authInfo)
  });

  const filter = {
    ...userFilter,
    ...scopeFilter
  };

  const count = await personaService.getPersonaAttributeCount({
    organisation: getOrgFromAuthInfo(authInfo),
    filter
  });

  return res.status(200).send(count);
});

export default {
  getPersonaAttribute,
  getPersonaAttributes,
  updatePersonaAttribute,
  addPersonaAttribute,
  deletePersonaAttribute,
  personaAttributeCount,
  personaAttributeConnection
};
