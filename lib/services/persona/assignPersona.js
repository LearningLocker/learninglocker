import mongoose from 'mongoose';
import Persona from 'lib/models/persona';
import PersonaIdentifier from 'lib/models/personaidentifier';
import NotFoundError from 'lib/errors/NotFoundError';
import getScopeFilter from 'lib/services/auth/filters/getScopeFilter';
import getOrgFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getOrgFromAuthInfo';

const objectId = mongoose.Types.ObjectId;

export default async ({ authInfo, personaId, identId }) => {
  await getScopeFilter({
    modelName: 'persona',
    actionName: 'edit',
    authInfo
  });
  const organisation = getOrgFromAuthInfo(authInfo);
  const personaObjectId = objectId(personaId);
  const identObjectId = objectId(identId);

  const persona = await Persona.findOne({
    _id: personaObjectId,
    organisation
  });

  if (!persona) throw new NotFoundError('persona', personaId);
  const ident = await PersonaIdentifier.findOne({
    _id: identObjectId,
    organisation
  });

  if (!ident) throw new NotFoundError('persona identifier', identId);
  ident.persona = personaObjectId;

  return ident.save();
};
