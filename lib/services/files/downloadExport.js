import Download from 'lib/models/download';
import getScopeFilter from 'lib/services/auth/filters/getScopeFilter';
import NotFoundError from 'lib/errors/NotFoundError';

export default async ({ authInfo, downloadId }) => {
  const idFilter = { _id: downloadId };
  const scopeFilter = await getScopeFilter({
    modelName: 'download',
    actionName: 'view',
    authInfo
  });
  const filter = {
    $and: [idFilter, scopeFilter]
  };
  const download = await Download.findOne(filter);
  if (download === null) throw new NotFoundError('download', downloadId);
  return {
    mime: download.upload.mime,
    key: download.upload.key
  };
};
