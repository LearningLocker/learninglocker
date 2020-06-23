import getAuthFromRequest from 'lib/helpers/getAuthFromRequest';
import catchErrors from 'api/controllers/utils/catchErrors';
import getJSONFromQuery from 'api/utils/getJSONFromQuery';
import getFromQuery from 'api/utils/getFromQuery';
import getOrgFromAuthInfo from 'lib/services/auth/authInfoSelectors/getOrgFromAuthInfo';
import getScopeFilter from 'lib/services/auth/filters/getScopeFilter';
import { MAX_TIME_MS } from 'lib/models/plugins/addCRUDFunctions';
import parseQuery from 'lib/helpers/parseQuery';
import { CursorDirection } from '@learninglocker/persona-service/dist/service/constants';
import { entityResponse, entitiesResponse } from 'api/controllers/utils/entitiesResponse';
import reasignPersonaStatements from 'lib/services/persona/reasignPersonaStatements';
import getPersonaService from 'lib/connections/personaService';

const MODEL_NAME = 'persona';

const personaService = getPersonaService();

const personaConnection = catchErrors(async (req, res) => {
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

  const reqFilter = getJSONFromQuery(req, 'filter', {});
  const filter = {
    ...(await parseQuery(reqFilter, { authInfo })),
    ...scopeFilter
  };

  const params = {
    limit: first || last || 10,
    direction: CursorDirection[before ? 'BACKWARDS' : 'FORWARDS'],
    sort,
    cursor: after || before,
    organisation: getOrgFromAuthInfo(authInfo),
    filter,
    project,
    hint,
    maxTimeMS: MAX_TIME_MS
  };

  const result = await personaService.getPersonasConnection(params);

  return res.status(200).send(result);
});

const updatePersona = catchErrors(async (req, res) => {
  const authInfo = getAuthFromRequest(req);
  const personaId = req.params.personaId; // getFromQuery(req, '_id', undefined);
  const newName = req.body.name;

  await getScopeFilter({
    modelName: MODEL_NAME,
    actionName: 'edit',
    authInfo
  });

  const { persona } = await personaService.updatePersona({
    organisation: getOrgFromAuthInfo(authInfo),
    personaId,
    name: newName
  });

  // Updates the name
  await reasignPersonaStatements({
    organisation: getOrgFromAuthInfo(authInfo),
    toId: personaId,
    fromId: personaId
  });

  return entityResponse(res, persona);
});

const mergePersona = catchErrors(async (req, res) => {
  const authInfo = getAuthFromRequest(req);

  await getScopeFilter({
    modelName: MODEL_NAME,
    actionName: 'edit',
    authInfo
  });

  const result = await personaService.mergePersona({
    organisation: getOrgFromAuthInfo(authInfo),
    fromPersonaId: req.query.mergePersonaFromId,
    toPersonaId: req.query.mergePersonaToId
  });

  await reasignPersonaStatements({
    fromId: req.query.mergePersonaFromId,
    toId: req.query.mergePersonaToId,
    organisation: getOrgFromAuthInfo(authInfo)
  });

  return res.status(200).send(result);
});

const deletePersona = catchErrors(async (req, res) => {
  const authInfo = getAuthFromRequest(req);

  await getScopeFilter({
    modelName: MODEL_NAME,
    actionName: 'delete',
    authInfo
  });

  const result = await personaService.deletePersona({
    organisation: getOrgFromAuthInfo(authInfo),
    personaId: req.params.personaId
  });

  return res.status(200).send(result);
});

const addPersona = catchErrors(async (req, res) => {
  const authInfo = getAuthFromRequest(req);
  await getScopeFilter({
    modelName: MODEL_NAME,
    actionName: 'create',
    authInfo
  });

  const { persona } = await personaService.createPersona({
    organisation: getOrgFromAuthInfo(authInfo),
    name: req.body.name
  });

  return entityResponse(res, persona);
});

const getPersona = catchErrors(async (req, res) => {
  const authInfo = getAuthFromRequest(req);
  await getScopeFilter({
    modelName: MODEL_NAME,
    actionName: 'view',
    authInfo
  });

  const { persona } = await personaService.getPersona({
    organisation: getOrgFromAuthInfo(authInfo),
    personaId: req.params.personaId
  });

  return entityResponse(res, persona);
});

const getPersonas = catchErrors(async (req, res) => {
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

  const { personas } = await personaService.getPersonas({
    sort,
    limit,
    skip,
    filter,
    organisation: getOrgFromAuthInfo(authInfo)
  });

  return entitiesResponse(res, personas);
});

const personaCount = catchErrors(async (req, res) => {
  const authInfo = getAuthFromRequest(req);

  const scopeFilter = await getScopeFilter({
    modelName: MODEL_NAME,
    actionName: 'view',
    authInfo
  });

  const userFilter = await parseQuery(req.query.query, { authInfo });

  const filter = {
    ...userFilter,
    ...scopeFilter
  };

  const count = await personaService.getPersonaCount({
    organisation: getOrgFromAuthInfo(authInfo),
    filter
  });

  return res.status(200).send(count);
});

export default {
  getPersona,
  getPersonas,
  updatePersona,
  addPersona,
  deletePersona,
  personaCount,
  personaConnection,

  mergePersona,
};
