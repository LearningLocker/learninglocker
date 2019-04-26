import boolean from 'boolean';
import { get, map } from 'lodash';
import BatchDelete, { asTime } from 'lib/models/batchDelete';
import NoAccessError from 'lib/errors/NoAccessError';
import parseQuery from 'lib/helpers/parseQuery';
import Statement from 'lib/models/statement';
import { publish as pubishToQueue } from 'lib/services/queue';
import { BATCH_STATEMENT_DELETION_QUEUE } from 'lib/constants/batchDelete';
import { SITE_SETTINGS_ID } from 'lib/constants/siteSettings';
import SiteSettings from 'lib/models/siteSettings';
import Client from 'lib/models/client';
import getScopeFilter from 'lib/services/auth/filters/getScopeFilter';
import moment from 'moment';

export default async ({
  batchDeleteId,
  publish = pubishToQueue
}, jobDone) => {
  if (boolean(get(process.env, 'ENABLE_STATEMENT_DELETION', true)) === false) {
    // Clear the job and don't do anything
    jobDone();
    return;
  }

  const siteSettings = await SiteSettings.findOne({
    _id: SITE_SETTINGS_ID
  });
  if (
    get(siteSettings, 'batchDeleteWindowStartTime') &&
    get(siteSettings, 'batchDeleteWindowDuration') &&
    !asTime(moment()).isBetween(
      asTime(get(siteSettings, 'batchDeleteWindowStartTime')),
      asTime(get(siteSettings, 'batchDeleteWindowStartTime'))
        .add(get(siteSettings, 'batchDeleteWindowDuration'), 'milliseconds')
    )
  ) {
    // We're not in the window
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
    // Another worker is proccessing this job, or it has finished
    jobDone();
    return;
  }

  let scopeFilter;
  try {
    scopeFilter = await getScopeFilter({
      modelName: 'statement',
      actionName: 'delete',
      authInfo: {
        client: await Client.findOne({ _id: batchDelete.client }),
        token: { tokenType: 'client' }
      }
    });
  } catch (err) {
    if (err instanceof NoAccessError) {
      // Do nothing
      await BatchDelete.findOneAndUpdate({
        _id: batchDeleteId
      }, {
        processing: false,
        done: true
      });

      jobDone();
      return;
    }
    throw err;
  }

  const filter = {
    ...(await parseQuery(batchDelete.filter)),
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

  let doneUpdate = {};
  const done = get(result, 'deletedCount') === 0;
  if (done) {
    doneUpdate = {
      done: true
    };
  }

  await BatchDelete.findOneAndUpdate({
    _id: batchDeleteId
  }, {
    processing: false,
    $inc: {
      deleteCount: get(result, 'deletedCount')
    },
    ...doneUpdate
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
