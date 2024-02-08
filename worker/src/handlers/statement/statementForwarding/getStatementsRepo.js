import createStatementsRepo from '@learninglocker/xapi-statements/dist/repo/facade';
import once from 'lodash/once';
import defaultTo from 'lodash/defaultTo';
import { join as joinPath } from 'path';

export default once(() => {
  const endpoint = defaultTo(process.env.FS_LOCAL_ENDPOINT, process.cwd());
  const subFolder = defaultTo(process.env.FS_SUBFOLDER, 'storage');
  const statementsSubFolder = defaultTo('statements', process.env.SUB_FOLDER_STATEMENTS);
  return createStatementsRepo({
    auth: {
      facade: 'mongo',
      mongo: {
        db: null, // We don't need this right now.
      },
    },
    events: {
      facade: process.env.EVENTS_REPO,
      redis: {
        client: null, // We don't need this right now.
        prefix: process.env.REDIS_PREFIX,
      },
      sentinel: {
        client: null, // We don't need this right now.
        prefix: process.env.REDIS_PREFIX,
      },
    },
    models: {
      facade: 'mongo',
      mongo: {
        db: null, // We don't need this right now.
      },
    },
    storage: {
      facade: process.env.FS_REPO === 'amazon' ? 's3' : process.env.FS_REPO,
      local: {
        storageDir: joinPath(endpoint, subFolder, statementsSubFolder),
      },
      s3: {
        awsConfig: {
          accessKeyId: process.env.FS_AWS_S3_ACCESS_KEY_ID,
          apiVersion: '2006-03-01',
          region: process.env.FS_AWS_S3_REGION,
          secretAccessKey: process.env.FS_AWS_S3_SECRET_ACCESS_KEY,
          signatureVersion: 'v4',
          sslEnabled: true,
        },
        bucketName: process.env.FS_AWS_S3_BUCKET,
        subFolder: process.env.FS_SUBFOLDER,
      },
    },
  });
});
