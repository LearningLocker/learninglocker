import Visualisation from 'lib/models/visualisation';
import testId from 'api/routes/tests/utils/testId';

export default (isPublic = false, owner = testId, organisation = testId) =>
  Visualisation.create({
    owner,
    axes: '',
    organisation,
    previewPeriod: 'LAST_7_DAYS',
    filters: [],
    chart: 'LINE',
    stacked: true,
    __v: 0,
    type: 'LEADERBOARD',
    description: 'Hello',
    isPublic
  });
