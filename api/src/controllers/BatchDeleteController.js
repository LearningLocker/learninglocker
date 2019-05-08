import boolean from 'boolean';
import getAuthFromRequest from 'lib/helpers/getAuthFromRequest';
import catchErrors from 'api/controllers/utils/catchErrors';
import getScopeFilter from 'lib/services/auth/filters/getScopeFilter';
import BatchDelete from 'lib/models/batchDelete';
import Statement from 'lib/models/statement';
import ClientError from 'lib/errors/ClientError';
import getOrgFromAuthInfo from 'lib/services/auth/authInfoSelectors/getOrgFromAuthInfo';
import parseQuery from 'lib/helpers/parseQuery';
import { BATCH_STATEMENT_DELETION_QUEUE } from 'lib/constants/batchDelete';
import { publish } from 'lib/services/queue';
import { get, isEmpty } from 'lodash';
import mongoose from 'mongoose';

const objectId = mongoose.Types.ObjectId;

const checkDeletionsEnabled = () => {
  if (boolean(get(process.env, 'ENABLE_STATEMENT_DELETION', true)) === false) {
    throw new ClientError('Statement deletions not enabled for this instance');
  }
};

const authenticate = async (req, modelName) => {
  const authInfo = getAuthFromRequest(req);

  const scopeFilter = await getScopeFilter({
    modelName,
    actionName: 'delete',
    authInfo
  });
  return { authInfo, scopeFilter };
};

const initialiseBatchDelete = catchErrors(async (req, res) => {
  checkDeletionsEnabled();

  // Authenticate
  const { authInfo, scopeFilter } = await authenticate(req, 'statement');

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

  return res.status(200).send(batchDelete);
});

const terminateBatchDelete = catchErrors(async (req, res) => {
  checkDeletionsEnabled();

  // Authenticate
  const { scopeFilter } = await authenticate(req, 'batchdelete');
  const filter = {
    ...scopeFilter,
    _id: objectId(req.params.id)
  };

  const batchDelete = await BatchDelete.findOne(filter);
  if (!batchDelete) {
    return res.status(404).send();
  }

  batchDelete.done = true;
  await batchDelete.save();
  return res.status(204).send();
});

const terminateAllBatchDeletes = catchErrors(async (req, res) => {
  checkDeletionsEnabled();

  // Authenticate
  const { scopeFilter } = await authenticate(req, 'batchdelete');
  await BatchDelete.updateMany(scopeFilter, {
    done: true
  });

  return res.status(204).send();
});

export default {
  initialiseBatchDelete,
  terminateBatchDelete,
  terminateAllBatchDeletes
};
