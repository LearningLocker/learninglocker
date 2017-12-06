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
import {
  isUndefined,
  omitBy,
} from 'lodash';
import { replaceId, replaceIds } from 'api/controllers/utils/replaceIds';

const objectId = mongoose.Types.ObjectId;

const personaIdentifierConnection = catchErrors(async (req, res) => {
  const { before, after } = req.query;

  const sort = getJSONFromQuery(req, 'sort', { _id: 1 });
  const hint = getJSONFromQuery(req, 'hint', undefined);
  const project = getJSONFromQuery(req, 'project', undefined);
  const first = getFromQuery(req, 'first', undefined, parseInt);
  const last = getFromQuery(req, 'last', undefined, parseInt);
  const authInfo = getAuthFromRequest(req);

  const scopeFilter = await getScopeFilter({
    modelName: 'persona',
    actionName: 'view',
    authInfo
  });

  const {
    persona,
    ...inFilter
  } = getJSONFromQuery(req, 'filter', {});

  const filter = {
    ...inFilter,
    persona: persona ? objectId(persona) : undefined,
    ...scopeFilter
  };
  const filterNoUndefined = omitBy(filter, isUndefined);

  const identifiers = await req.personaService.getIdentifiers({
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

  return res.status(200).send(identifiers);
});

const addPersonaIdentifier = catchErrors(async (req, res) => {
  const authInfo = getAuthFromRequest(req);

  await getScopeFilter({
    modelName: 'persona',
    actionName: 'edit',
    authInfo
  });

  const { identifier } = await req.personaService.createIdentifier({
    ifi: req.body.ifi,
    organisation: getOrgFromAuthInfo(authInfo),
    persona: req.body.persona
  });

  return res.status(200).send(replaceId(identifier));
});

const getPersonaIdentifier = catchErrors(async (req, res) => {
  const authInfo = getAuthFromRequest(req);

  await getScopeFilter({
    modelName: 'persona',
    actionName: 'view',
    authInfo
  });

  const { identifier } = await req.personaService.getIdentifier({
    organisation: getOrgFromAuthInfo(authInfo),
    id: req.params.personaIdentifierId
  });

  return res.status(200).send(replaceId(identifier));
});

const getPersonaIdentifiers = catchErrors(async (req, res) => {
  const authInfo = getAuthFromRequest(req);

  await getScopeFilter({
    modelName: 'persona',
    actionName: 'view',
    authInfo
  });

  const { identifiers } = await req.personaService.getPersonaIdentifiers({
    ...req.query,
    organisation: getOrgFromAuthInfo(authInfo),
  });

  return res.status(200).send(replaceIds(identifiers));
});

const updatePersonaIdentifier = catchErrors(async (req, res) => {
  const authInfo = getAuthFromRequest(req);

  await getScopeFilter({
    modelName: 'persona',
    actionName: 'view',
    authInfo
  });

  const { identifier } = await req.personaService.overwriteIdentifier({
    organisation: getOrgFromAuthInfo(authInfo),
    id: req.params.personaIdentifierId,
    ifi: req.body.ifi,
    persona: req.body.persona
  });

  return res.status(200).send(replaceId(identifier));
});

const deletePersonaIdentifier = catchErrors(async (req, res) => {
  const authInfo = getAuthFromRequest(req);

  await getScopeFilter({
    modelName: 'persona',
    actionName: 'edit',
    authInfo
  });

  await req.personaService.deletePersonaIdentifier({
    organisation: getOrgFromAuthInfo(authInfo),
    id: req.params.personaIdentifierId
  });

  return res.status(200).send();
});

const personaIdentifierCount = catchErrors(async (req, res) => {
  const authInfo = getAuthFromRequest(req);

  const scopeFilter = await getScopeFilter({
    modelName: 'persona',
    actionName: 'view',
    authInfo
  });

  const userFilter = await parseQuery(req.query.query);

  const filter = {
    ...userFilter,
    ...scopeFilter
  };

  const count = await req.personaService.getPersonaIdentifierCount({
    organisation: getOrgFromAuthInfo(authInfo),
    filter
  });

  return res.status(200).send(count);
});

export default {
  getPersonaIdentifier,
  getPersonaIdentifiers,
  updatePersonaIdentifier,
  addPersonaIdentifier,
  deletePersonaIdentifier,
  personaIdentifierCount,
  personaIdentifierConnection,
};
