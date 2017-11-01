import mongoose from 'mongoose';
import getAuthFromRequest from 'lib/helpers/getAuthFromRequest';
import catchErrors from 'api/controllers/utils/catchErrors';
import getJSONFromQuery from 'api/utils/getJSONFromQuery';
import getFromQuery from 'api/utils/getFromQuery';
import getOrgFromAuthInfo from 'lib/services/auth/authInfoSelectors/getOrgFromAuthInfo';
import getScopeFilter from 'lib/services/auth/filters/getScopeFilter';
import { MAX_TIME_MS, MAX_SCAN } from 'lib/models/plugins/addCRUDFunctions';
import parseQuery from 'lib/helpers/parseQuery';
import { CursorDirection } from 'personas/dist/service/constants';

const objectId = mongoose.Types.ObjectId;

const connection = catchErrors(async (req, res) => {
  const { before, after } = req.query;

  const sort = getJSONFromQuery(req, 'sort', { _id: 1 });
  const hint = getJSONFromQuery(req, 'hint', undefined);
  const project = getJSONFromQuery(req, 'project', undefined);
  const first = getFromQuery(req, 'first', undefined, parseInt);
  const last = getFromQuery(req, 'last', undefined, parseInt);
  const authInfo = getAuthFromRequest(req);

  const scopeFilter = await getScopeFilter({
    modelName: 'personasImport',
    actionName: 'viewAllScope',
    authInfo
  });

  const filter = {
    ...(await parseQuery(
      getJSONFromQuery(req, 'filter', {})
    )),
    ...scopeFilter
  };

  const personas = await req.personaService.getPersonas({
    limit: first || last,
    direction: CursorDirection[before ? 'BACKWARDS' : 'FORWARDS'],
    sort,
    cursor: after || before,
    organisation: getOrgFromAuthInfo(authInfo),
    filter,
    project,
    hint,
    maxTimeMS: MAX_TIME_MS,
    maxScan: MAX_SCAN
  });

  return res.status(200).send(personas);
});
const update = catchErrors(async (req, res) => {
  const authInfo = getAuthFromRequest(req);
  const personaId = req.params.personaId; // getFromQuery(req, '_id', undefined);
  const newName = req.body.name;

  await getScopeFilter({
    modelName: 'personasImport',
    actionName: 'editAllScope',
    authInfo
  });

  const { persona } = await req.personaService.updatePersona({
    organisation: getOrgFromAuthInfo(authInfo),
    personaId,
    name: newName
  });

  return res.status(200).send({
    ...persona,
    _id: persona.id
  });
});

const getIdentifiers = catchErrors(async (req, res) => {
  const { before, after } = req.query;

  const sort = getJSONFromQuery(req, 'sort', { _id: 1 });
  const hint = getJSONFromQuery(req, 'hint', undefined);
  const project = getJSONFromQuery(req, 'project', undefined);
  const first = getFromQuery(req, 'first', undefined, parseInt);
  const last = getFromQuery(req, 'last', undefined, parseInt);
  const authInfo = getAuthFromRequest(req);

  const scopeFilter = await getScopeFilter({
    modelName: 'personasImport',
    actionName: 'viewAllScope',
    authInfo
  });

  const {
    persona,
    ...inFilter
  } = getJSONFromQuery(req, 'filter', {});

  const filter = {
    ...inFilter,
    persona: objectId(persona),
    ...scopeFilter
  };

  const identifiers = await req.personaService.getIdentifiers({
    limit: first || last,
    direction: before ? 'BACKWARDS' : 'FORWARDS',
    sort,
    cursor: after || before,
    organisation: getOrgFromAuthInfo(authInfo),
    filter,
    project,
    hint,
    maxTimeMS: MAX_TIME_MS,
    maxScan: MAX_SCAN
  });

  return res.status(200).send(identifiers);
});

const postIdentifier = catchErrors(async (req, res) => {
  const authInfo = getAuthFromRequest(req);

  await getScopeFilter({
    modelName: 'personasImport',
    actionName: 'editAllScope',
    authInfo
  });

  const identifier = await req.personaService.createIdentifier({
    ifi: req.body.ifi,
    organisation: getOrgFromAuthInfo(authInfo),
    persona: req.body.persona
  });

  return res.status(200).send(identifier);
});

const getPersonaCount = catchErrors(async (req, res) => {
  const authInfo = getAuthFromRequest(req);

  const scopeFilter = await getScopeFilter({
    modelName: 'persona',
    actionName: 'viewAllScope',
    authInfo
  });

  const userFilter = await parseQuery(req.query.query);

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

const mergePersona = catchErrors(async(req, res) => {
  const authInfo = getAuthFromRequest(req);

  await getScopeFilter({
    modelName: 'persona',
    actionName: 'editAllScope',
    authInfo
  });

  const result = await req.personaService.mergePersona({
    organisation: getOrgFromAuthInfo(authInfo),
    fromPersonaId: req.query.mergePersonaFromId,
    toPersonaId: req.query.mergePersonaToId
  });

  return res.status(200).send(result);
});

export default {
  connection,
  update,
  getIdentifiers,
  postIdentifier,
  getPersonaCount,
  mergePersona
};
