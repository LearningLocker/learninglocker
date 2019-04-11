import getAuthFromRequest from 'lib/helpers/getAuthFromRequest';
import catchErrors from 'api/controllers/utils/catchErrors';
import getScopeFilter from 'lib/services/auth/filters/getScopeFilter';
import BatchDelete from 'lib/models/batchDelete';
import Statement from 'lib/models/statement';
import getOrgFromAuthInfo from 'lib/services/auth/authInfoSelectors/getOrgFromAuthInfo';
import parseQuery from 'lib/helpers/parseQuery';
import { BATCH_STATEMENT_DELETION_QUEUE } from 'lib/constants/batchDelete';
import { publish } from 'lib/services/queue';
import { get } from 'lodash';


const initialiseBatchDelete = catchErrors(async (req, res) => {
  // Authenticate
  const authInfo = getAuthFromRequest(req);

  const scopeFilter = await getScopeFilter({
    modelName: 'statement',
    actionName: 'delete',
    authInfo
  });

  const filter = {
    ...(await parseQuery(req.query.filter)),
    ...scopeFilter
  };

  const total = await Statement
    .find(filter)
    .count();

  console.log('authInfo', JSON.stringify(authInfo, null, 2));
  const batchDelete = new BatchDelete({
    organisation: getOrgFromAuthInfo(authInfo),
    total,
    filter: req.query.filter,
    client: get(authInfo, 'client.id')
  });
  await batchDelete.save();

  await publish({
    queueName: BATCH_STATEMENT_DELETION_QUEUE,
    payload: {
      batchDeleteId: batchDelete._id.toString(),
    },
  });

  res.sendStatus(200);
});

export default {
  initialiseBatchDelete
};
