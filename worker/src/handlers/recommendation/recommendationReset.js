import QueryBuilderCacheValue from 'lib/models/querybuildercachevalue';
import Organisation from 'lib/models/organisation';
import moment from 'moment';
import { get } from 'lodash';
import { SHOW } from 'lib/constants/recommendation';

const recommendationReset = async ({ organisationId }) => {
  const organisation = await Organisation.findById(organisationId);
  const windowSize /* seconds */ = get(organisation, ['settings', 'RECOMMENDATION_WINDOW_SIZE']);
  await QueryBuilderCacheValue.update({
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
};

export default recommendationReset;
