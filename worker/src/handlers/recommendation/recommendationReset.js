import mongoose from 'mongoose';
import QueryBuilderCacheValue from 'lib/models/querybuildercachevalue';
import { SHOW } from 'lib/constants/recommendation';

const objectId = mongoose.Types.ObjectId;

export const recommendationReset = async ({ organisationId }) => {
  const organisations = await Organisation.findById(organisationId);
  
  const windowSize /* seconds */ = get(organisation, ['settings', 'recommendationWindowSize']);
  await QueryBuliderCacheValue.update({
    updatedAt: {
      $lt: moment().subtract(windowSize, 'seconds').toDate()
    }
  }, {
    recommendationWindowCount: 0,
    recommendationWindowStart: moment().toDate(),
    recommendationStatus: SHOW
  }, {
    upsert: false
  });
}