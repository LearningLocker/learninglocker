import mongoose from 'mongoose';
import Statement from 'lib/models/statement';
import personaService from 'lib/connections/personaService';
import getActorFilterFromIfi from './utils/getActorFilterFromIfi';

const objectId = mongoose.Types.ObjectId;

/**
 * Check if the identifier's IFI matches any statements in this organisation
 * @param organisation string
 * @param identifierId string
 * @returns Boolean
 */
export default async ({
  organisation,
  identifierId
}) => {
  const { identifier } = await personaService().getIdentifier({
    organisation,
    id: identifierId
  });


  const actorFilter = getActorFilterFromIfi(identifier.ifi);

  const filter = {
    organisation: objectId(organisation),
    ...actorFilter,
  };

  const statement = await Statement
    .findOne(filter)
    .select({ _id: 1 })
    .setOptions({ lean: true });
  return !!statement;
};
