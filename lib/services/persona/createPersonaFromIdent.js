import mongoose from 'mongoose';
import PersonaFinder from 'lib/classes/PersonaFinder';
import PersonaIdentifier from 'lib/models/personaidentifier';
import getScopeFilter from 'lib/services/auth/filters/getScopeFilter';
import getOrgFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getOrgFromAuthInfo';

const objectId = mongoose.Types.ObjectId;

export default async ({ authInfo, identId }) => {
  await getScopeFilter({
    modelName: 'persona',
    actionName: 'edit',
    authInfo
  });
  const organisation = getOrgFromAuthInfo(authInfo);
  const identObjectId = objectId(identId);

  const ident = await PersonaIdentifier.findOne({
    _id: identObjectId,
    organisation
  });

  const personaFinder = new PersonaFinder();
  await new Promise((resolve, reject) => {
    const next = (err) => {
      if (err) return reject(err);
      return resolve();
    };
    personaFinder.createPersonaFromPersonaIdentifier(ident, next);
  });

  const updatedIdent = await PersonaIdentifier.findOne({
    _id: identObjectId,
    organisation
  });

  return updatedIdent;
};
