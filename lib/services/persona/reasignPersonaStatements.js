import mongoose from 'mongoose';
import Statement from 'lib/models/statement';

const objectId = mongoose.Types.ObjectId;


export default async ({
  fromId,
  toId,
  organisation
}) => {
  await Statement.update({
    organisation: objectId(organisation),
    'person._id': objectId(fromId)
  }, {
    'person._id': objectId(toId)
  }, {
    multi: true
  });
};
