import createStatementsRepo from '@learninglocker/xapi-statements/dist/repo/facade';
import { getConnection } from 'lib/connections/mongoose';
import { createClient } from 'lib/connections/redis';
import once from 'lodash/once';

export default once(() => createStatementsRepo({
  auth: {
    facade: 'mongo',
    mongo: {
      db: getConnection(),
    },
  },
  events: {
    facade: process.env.EVENTS_REPO,
    redis: {
      client: createClient(),
      prefix: process.env.REDIS_PREFIX,
    },
    sentinel: {
      client: createClient(),
      prefix: process.env.REDIS_PREFIX,
    },
  },
  models: {
    facade: 'mongo',
    mongo: {
      db: getConnection(),
    },
  },
  storage: {
    facade: process.env.FS_REPO === 'amazon' ? 's3' : process.env.FS_REPO,
    google: {
      bucketName: process.env.FS_GOOGLE_CLOUD_BUCKET,
      keyFileName: process.env.FS_GOOGLE_CLOUD_KEY_FILENAME,
      projectId: process.env.FS_GOOGLE_CLOUD_PROJECT_ID,
      subFolder: process.env.FS_SUBFOLDER,
    },
    local: {
      storageDir: `${process.env.FS_LOCAL_ENDPOINT}/${process.env.FS_SUBFOLDER}`,
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
}));
