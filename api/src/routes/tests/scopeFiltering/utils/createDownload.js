import Download from 'lib/models/download';
import testId from 'api/routes/tests/utils/testId';

export default (overrides = {}) =>
  Download.create({
    owner: testId,
    organisation: testId,
    name: 'Test download',
    url: 'test url',
    isReady: true,
    pipelines: [
      JSON.stringify({
        _id: 1,
        version: '$statement.version'
      })
    ],
    time: new Date(),
    isPublic: false,
    upload: {
      mime: 'text/csv',
      key: 'tests/exportDownload.csv',
      repo: 'local'
    },
    ...overrides
  });
