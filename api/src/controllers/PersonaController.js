import getAuthFromRequest from 'lib/helpers/getAuthFromRequest';
import catchErrors from 'api/controllers/utils/catchErrors';
import getJSONFromQuery from 'api/utils/getJSONFromQuery';
import getFromQuery from 'api/utils/getFromQuery';
import getOrgFromAuthInfo from 'lib/services/auth/authInfoSelectors/getOrgFromAuthInfo';
import getScopeFilter from 'lib/services/auth/filters/getScopeFilter';
import { MAX_TIME_MS, MAX_SCAN } from 'lib/models/plugins/addCRUDFunctions';


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
    ...getJSONFromQuery(req, 'filter', {}),
    ...scopeFilter
  };

  const personas = await req.personaService.getPersonas({
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

  return res.status(200).send(personas);
});

// TODO: remove/replace
// const createPersonaFromIdentifier = catchErrors(async (req, res) => {
//   const { personaIdentifierId } = req.query;
//   const authInfo = getAuthFromRequest(req);
//   const ident = await service.createPersonaFromIdent({
//     authInfo,
//     identId: personaIdentifierId
//   });
//   return res.status(200).json(ident).send();
// });

// const assignPersona = catchErrors(async (req, res) => {
//   const { personaId, personaIdentifierId } = req.query;
//   const authInfo = getAuthFromRequest(req);
//   const ident = await service.assignPersona({
//     authInfo,
//     personaId,
//     identId: personaIdentifierId
//   });
//   return res.status(200).json(ident).send();
// });

// const mergePersona = catchErrors(async (req, res) => {
//   const { mergePersonaFromId, mergePersonaToId } = req.query;
//   const authInfo = getAuthFromRequest(req);
//   const updateIdents = await service.mergePersonasWithAuth(
//     authInfo,
//     mergePersonaFromId,
//     mergePersonaToId
//   );
//   return res.status(200).json(updateIdents).send();
// });

export default {
  connection
};

// export default {
//   createPersonaFromIdentifier,
//   assignPersona,
//   mergePersona
// };
