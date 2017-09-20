import * as service from 'lib/services/persona';
import getAuthFromRequest from 'lib/helpers/getAuthFromRequest';
import catchErrors from 'api/controllers/utils/catchErrors';

const createPersonaFromIdentifier = catchErrors(async (req, res) => {
  const { personaIdentifierId } = req.query;
  const authInfo = getAuthFromRequest(req);
  const ident = await service.createPersonaFromIdent({
    authInfo,
    identId: personaIdentifierId
  });
  return res.status(200).json(ident).send();
});

const assignPersona = catchErrors(async (req, res) => {
  const { personaId, personaIdentifierId } = req.query;
  const authInfo = getAuthFromRequest(req);
  const ident = await service.assignPersona({
    authInfo,
    personaId,
    identId: personaIdentifierId
  });
  return res.status(200).json(ident).send();
});

const mergePersona = catchErrors(async (req, res) => {
  const { mergePersonaFromId, mergePersonaToId } = req.query;
  const authInfo = getAuthFromRequest(req);
  const updateIdents = await service.mergePersonasWithAuth(
    authInfo,
    mergePersonaFromId,
    mergePersonaToId
  );
  return res.status(200).json(updateIdents).send();
});

export default {
  createPersonaFromIdentifier,
  assignPersona,
  mergePersona
};
