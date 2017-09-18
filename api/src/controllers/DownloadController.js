import * as fileService from 'lib/services/files';
import { downloadToStream } from 'lib/services/files/storage';
import getAuthFromRequest from 'lib/helpers/getAuthFromRequest';
import catchErrors from 'api/controllers/utils/catchErrors';

const downloadLogo = catchErrors(async (req, res) => {
  const authInfo = getAuthFromRequest(req);
  const orgId = req.params.org;
  const { mime, key } = await fileService.downloadLogo({
    authInfo,
    orgId
  });
  res.header('Content-Type', mime);
  return downloadToStream(key)(res);
});

const downloadExport = catchErrors(async (req, res) => {
  const authInfo = getAuthFromRequest(req);
  const downloadId = req.params.download;
  const { mime, key } = await fileService.downloadExport({
    authInfo,
    downloadId
  });
  res.header('Content-Type', mime);
  return downloadToStream(key)(res);
});

export default {
  downloadLogo,
  downloadExport
};
