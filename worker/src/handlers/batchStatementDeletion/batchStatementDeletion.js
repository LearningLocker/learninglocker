import boolean from 'boolean';
import { get, map, isEmpty } from 'lodash';
import BatchDelete, { inWindow } from 'lib/models/batchDelete';
import NoAccessError from 'lib/errors/NoAccessError';
import parseQuery from 'lib/helpers/parseQuery';
import Statement from 'lib/models/statement';
import logger from 'lib/logger';
import { publish as publishToQueue } from 'lib/services/queue';
import { BATCH_STATEMENT_DELETION_QUEUE } from 'lib/constants/batchDelete';
import { SITE_SETTINGS_ID } from 'lib/constants/siteSettings';
import SiteSettings from 'lib/models/siteSettings';
import Client from 'lib/models/client';
import getScopeFilter from 'lib/services/auth/filters/getScopeFilter';

const markDone = async (batchDeleteId, jobDone) => {
  logger.debug(`Removing job for BatchDelete ${batchDeleteId} and marking as done`);
  // Do nothing
  await BatchDelete.findOneAndUpdate({
    _id: batchDeleteId
  }, {
    processing: false,
    done: true
  });

  jobDone();
  return;
};

export default async ({
  batchDeleteId,
  publish = publishToQueue
}, jobDone) => {
  if (boolean(get(process.env, 'ENABLE_STATEMENT_DELETION', true)) === false) {
    // Clear the job and don't do anything
    jobDone();
    return;
  }

  const siteSettings = await SiteSettings.findOne({
    _id: SITE_SETTINGS_ID
  });

  // Check if "windowing" is enabled AND if we are out of the window
  const inDeletionWindow = inWindow(siteSettings);
  if (inDeletionWindow) {
    logger.debug('In window - processing batch deletion');
  } else {
    logger.debug('Out of window - not processing batch deletion');
    jobDone();
    return;
  }

  const batchDelete = await BatchDelete.findOneAndUpdate({
    _id: batchDeleteId,
    processing: false,
    done: false
  }, {
    processing: true
  });

  if (!batchDelete) {
    // Another worker is processing this job, or it has finished
    jobDone();
    return;
  }

  let scopeFilter;
  // simulate the auth policy for the client that started this batch worker
  const authInfo = {
    client: await Client.findOne({ _id: batchDelete.client }),
    token: { tokenType: 'client' }
  };
  try {
    scopeFilter = await getScopeFilter({
      modelName: 'statement',
      actionName: 'delete',
      authInfo
    });
  } catch (err) {
    if (err instanceof NoAccessError) {
      // Do nothing and delete job
      return await markDone(batchDeleteId, jobDone);
    }
    throw err;
  }

  let parsedFilter;
  try {
    parsedFilter = JSON.parse(batchDelete.filter);
  } catch (err) {
    logger.debug('Error parsing batch deletion filter', err);
    return await markDone(batchDeleteId, jobDone);
  }
  if (isEmpty(parsedFilter)) {
    logger.debug('Filter cannot be blank');
    return await markDone(batchDeleteId, jobDone);
  }

  const filter = {
    ...(await parseQuery(parsedFilter, { authInfo })),
    ...scopeFilter
  };


  const docs = await Statement.find(filter, '_id')
    .limit(batchDelete.pageSize);

  const idsToDelete = map(docs, ({ _id }) => _id);

  const result = await Statement.deleteMany({
    _id: {
      $in: idsToDelete
    }
  }, {});

  const done = get(result, 'deletedCount') === 0;

  await BatchDelete.findOneAndUpdate({
    _id: batchDeleteId
  }, {
    processing: false,
    $inc: {
      deleteCount: get(result, 'deletedCount')
    },
    done,
  });

  if (!done) {
    await publish({
      queueName: BATCH_STATEMENT_DELETION_QUEUE,
      payload: {
        batchDeleteId
      }
    });
  }

  jobDone();
};
