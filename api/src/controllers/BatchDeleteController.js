import boolean from 'boolean';
import getAuthFromRequest from 'lib/helpers/getAuthFromRequest';
import catchErrors from 'api/controllers/utils/catchErrors';
import getScopeFilter from 'lib/services/auth/filters/getScopeFilter';
import BatchDelete from 'lib/models/batchDelete';
import Statement from 'lib/models/statement';
import ClientError from 'lib/errors/ClientError';
import getOrgFromAuthInfo from 'lib/services/auth/authInfoSelectors/getOrgFromAuthInfo';
import parseQuery from 'lib/helpers/parseQuery';
import logger from 'lib/logger';
import { BATCH_STATEMENT_DELETION_QUEUE } from 'lib/constants/batchDelete';
import { publish } from 'lib/services/queue';
import { get, isEmpty } from 'lodash';


const initialiseBatchDelete = catchErrors(async (req, res) => {
  if (boolean(get(process.env, 'ENABLE_STATEMENT_DELETION', true)) === false) {
    // Clear the job and don't do anything
    throw new ClientError('Statement deletions not enabled for this instance');
  }

  // Authenticate
  const authInfo = getAuthFromRequest(req);

  const scopeFilter = await getScopeFilter({
    modelName: 'statement',
    actionName: 'delete',
    authInfo
  });

  const body = req.body;
  const bodyFilter = get(body, 'filter', false);

  if (isEmpty(bodyFilter)) {
    throw new ClientError('Filter cannot be empty');
  }

  const filter = {
    ...(await parseQuery(bodyFilter)),
    ...scopeFilter
  };

  const total = await Statement.countDocuments(filter);

  const batchDelete = new BatchDelete({
    organisation: getOrgFromAuthInfo(authInfo),
    total,
    filter: JSON.stringify(bodyFilter),
    client: get(authInfo, 'client.id')
  });
  await batchDelete.save();

  await publish({
    queueName: BATCH_STATEMENT_DELETION_QUEUE,
    payload: {
      batchDeleteId: batchDelete._id.toString(),
    },
  });

  res.status(200).send(batchDelete);
});

const terminateBatchDelete = catchErrors(async (req, res) => {
  res.sendStatus(204);
});

export default {
  initialiseBatchDelete,
  terminateBatchDelete
};
