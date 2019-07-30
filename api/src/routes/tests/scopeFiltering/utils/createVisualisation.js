import { LEADERBOARD } from 'lib/constants/visualise';
import Visualisation from 'lib/models/visualisation';
import testId from 'api/routes/tests/utils/testId';

export default (isPublic = false, owner = testId, organisation = testId) =>
  Visualisation.create({
    owner,
    axes: '',
    organisation,
    previewPeriod: 'LAST_7_DAYS',
    filters: [],
    stacked: true,
    __v: 0,
    type: LEADERBOARD,
    description: 'Hello',
    isPublic
  });
