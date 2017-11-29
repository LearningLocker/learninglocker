import mongoose from 'mongoose';
import Statement from 'lib/models/statement';
import personaService from 'lib/connections/personaService';

const objectId = mongoose.Types.ObjectId;

export default async ({
  fromId,
  toId,
  organisation
}) => {
  const { persona } = await personaService().getPersona({
    organisation,
    personaId: toId
  });

  await Statement.update({
    organisation: objectId(organisation),
    'person._id': objectId(fromId)
  }, {
    person: {
      _id: objectId(toId),
      display: persona.name
    }
  }, {
    multi: true
  });
};
