import mongoose from 'mongoose';
import Statement from 'lib/models/statement';
import personaService from 'lib/connections/personaService';

const objectId = mongoose.Types.ObjectId;

export default async ({
  fromId,
  toId,
  organisation
}) => {
  const { persona: toPersona } = await personaService().getPersona({
    organisation,
    personaId: toId
  });

  const filter = {
    organisation: objectId(organisation),
    'person._id': objectId(fromId)
  };

  // always update the display
  const update = {
    'person.display': toPersona.name
  };

  // only update the ID if required
  if (fromId !== toId) {
    update['person._id'] = objectId(toId);
  }

  await Statement.updateMany(filter, update);
};
