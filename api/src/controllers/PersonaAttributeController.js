import mongoose from 'mongoose';
import getJSONFromQuery from 'api/utils/getJSONFromQuery';
import catchErrors from 'api/controllers/utils/catchErrors';
import getFromQuery from 'api/utils/getFromQuery';
import getOrgFromAuthInfo from 'lib/services/auth/authInfoSelectors/getOrgFromAuthInfo';
import getAuthFromRequest from 'lib/helpers/getAuthFromRequest';
import getScopeFilter from 'lib/services/auth/filters/getScopeFilter';
import { CursorDirection } from 'personas/dist/service/constants';
import { MAX_TIME_MS, MAX_SCAN } from 'lib/models/plugins/addCRUDFunctions';
import parseQuery from 'lib/helpers/parseQuery';
import updateQueryBuilderCache from 'lib/services/importPersonas/updateQueryBuilderCache';
import {
  isUndefined,
  omitBy,
} from 'lodash';
import { replaceId, replaceIds } from 'api/controllers/utils/replaceIds';

const objectId = mongoose.Types.ObjectId;

const MODEL_NAME = 'personaAttribute';

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

  const attributes = await req.personaService.getAttributes({
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

  return res.status(200).send(attributes);
});

const addPersonaAttribute = catchErrors(async (req, res) => {
  const authInfo = getAuthFromRequest(req);

  await getScopeFilter({
    modelName: MODEL_NAME,
    actionName: 'edit',
    authInfo
  });

  const parsedBody = await parseQuery(
    req.body,
    {
      organisation: getOrgFromAuthInfo(authInfo)
    }
  );

  const { attribute } = await req.personaService.overwritePersonaAttribute({
    organisation: getOrgFromAuthInfo(authInfo),
    personaId: toString(parsedBody.personaId),
    key: parsedBody.key,
    value: parsedBody.value
  });

  updateQueryBuilderCache({
    attributes: [attribute],
    organisation: getOrgFromAuthInfo(authInfo)
  });

  return res.status(200).send(replaceId(attribute));
});

const getPersonaAttribute = catchErrors(async (req, res) => {
  const authInfo = getAuthFromRequest(req);

  await getScopeFilter({
    modelName: MODEL_NAME,
    actionName: 'viewAllScope',
    authInfo
  });

  const { attribute } = await req.personaService.getAttribute({
    organisation: getOrgFromAuthInfo(authInfo),
    id: req.params.personaAttributeId
  });

  return res.status(200).send(replaceId(attribute));
});

const getPersonaAttributes = catchErrors(async (req, res) => {
  const authInfo = getAuthFromRequest(req);

  await getScopeFilter({
    modelName: MODEL_NAME,
    actionName: 'view',
    authInfo
  });

  const { attributes } = await req.personaService.getPersonaAttributes({
    ...req.query,
    organisation: getOrgFromAuthInfo(authInfo),
  });

  return res.status(200).send(replaceIds(attributes));
});

const updatePersonaAttribute = catchErrors(async (req, res) => {
  const authInfo = getAuthFromRequest(req);

  await getScopeFilter({
    modelName: MODEL_NAME,
    actionName: 'edit',
    authInfo
  });

  const { attribute } = await req.personaService.overwritePersonaAttribute({
    ...req.body,
    organisation: getOrgFromAuthInfo(authInfo),
    id: req.params.personaAttributeId
  });

  return res.status(200).send(replaceId(attribute));
});
const deletePersonaAttribute = catchErrors(async (req, res) => {
  const authInfo = getAuthFromRequest(req);

  await getScopeFilter({
    modelName: MODEL_NAME,
    actionName: 'edit',
    authInfo
  });

  await req.personaService.deletePersonaAttribute({
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

  const userFilter = await parseQuery(req.query.query);

  const filter = {
    ...userFilter,
    ...scopeFilter
  };

  const count = await req.personaService.getPersonaAttributeCount({
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
