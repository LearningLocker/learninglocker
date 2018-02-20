import mongoose from 'mongoose';
import getJSONFromQuery from 'api/utils/getJSONFromQuery';
import catchErrors from 'api/controllers/utils/catchErrors';
import getFromQuery from 'api/utils/getFromQuery';
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

const objectId = mongoose.Types.ObjectId;

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

  const {
    personaId,
    ...inFilter
  } = getJSONFromQuery(req, 'filter', {});

  const filter = {
    ...inFilter,
    personaId: personaId ? objectId(personaId) : undefined,
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

  const { attributes } = await personaService.getPersonaAttributes({
    ...req.query,
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
  const { attribute } = await personaService.overwritePersonaAttribute({
    ...req.body,
    organisation,
    id: req.params.personaAttributeId
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
