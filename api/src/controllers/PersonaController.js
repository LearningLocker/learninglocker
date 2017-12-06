import getAuthFromRequest from 'lib/helpers/getAuthFromRequest';
import catchErrors from 'api/controllers/utils/catchErrors';
import getJSONFromQuery from 'api/utils/getJSONFromQuery';
import getFromQuery from 'api/utils/getFromQuery';
import getOrgFromAuthInfo from 'lib/services/auth/authInfoSelectors/getOrgFromAuthInfo';
import getScopeFilter from 'lib/services/auth/filters/getScopeFilter';
import { MAX_TIME_MS, MAX_SCAN } from 'lib/models/plugins/addCRUDFunctions';
import parseQuery from 'lib/helpers/parseQuery';
import { CursorDirection } from 'personas/dist/service/constants';
import { reasignPersonaStatements } from 'lib/services/persona';

const MODEL_NAME = 'persona';

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

  const filter = {
    ...(await parseQuery(
      getJSONFromQuery(req, 'filter', {})
    )),
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
    maxTimeMS: MAX_TIME_MS,
    maxScan: MAX_SCAN
  };

  const personas = await req.personaService.getPersonasConnection(params);

  return res.status(200).send(personas);
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

  const { persona } = await req.personaService.updatePersona({
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

  return res.status(200).send({
    ...persona,
    _id: persona.id
  });
});

const mergePersona = catchErrors(async(req, res) => {
  const authInfo = getAuthFromRequest(req);

  await getScopeFilter({
    modelName: MODEL_NAME,
    actionName: 'edit',
    authInfo
  });

  const result = await req.personaService.mergePersona({
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

const deletePersona = catchErrors(async(req, res) => {
  const authInfo = getAuthFromRequest(req);

  await getScopeFilter({
    modelName: MODEL_NAME,
    actionName: 'delete',
    authInfo
  });

  const result = await req.personaService.deletePersona({
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

  const { persona } = await req.personaService.createPersona({
    organisation: getOrgFromAuthInfo(authInfo),
    name: req.body.name
  });

  return res.status(200).send(persona);
});

const getPersona = catchErrors(async (req, res) => {
  const authInfo = getAuthFromRequest(req);
  await getScopeFilter({
    modelName: MODEL_NAME,
    actionName: 'view',
    authInfo
  });

  const { persona } = await req.personaService.getPersona({
    organisation: getOrgFromAuthInfo(authInfo),
    personaId: req.params.personaId
  });

  return res.status(200).send(persona);
});

const getPersonas = catchErrors(async (req, res) => {
  const authInfo = getAuthFromRequest(req);

  await getScopeFilter({
    modelName: MODEL_NAME,
    actionName: 'view',
    authInfo
  });

  const { personas } = await req.personaService.getPersonas({
    ...req.query,
    organisation: getOrgFromAuthInfo(authInfo)
  });

  return res.status(200).send(personas);
});

const personaCount = catchErrors(async (req, res) => {
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

  const count = await req.personaService.getPersonaCount({
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
