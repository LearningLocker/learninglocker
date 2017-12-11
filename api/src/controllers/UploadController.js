import * as fileService from 'lib/services/files';
import getAuthFromRequest from 'lib/helpers/getAuthFromRequest';
import catchErrors from 'api/controllers/utils/catchErrors';
import getFileFromRequest from 'api/controllers/utils/getFileFromRequest';

const uploadLogo = catchErrors(async (req, res) => {
  const orgId = req.query.data;
  const authInfo = getAuthFromRequest(req);
  const file = await getFileFromRequest(req);
  const path = await fileService.uploadLogo({ authInfo, orgId, file });
  return res.status(200).send(path);
});

export default {
  uploadLogo
};
