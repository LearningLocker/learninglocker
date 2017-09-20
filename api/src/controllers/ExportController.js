import * as fileService from 'lib/services/files';
import getAuthFromRequest from 'lib/helpers/getAuthFromRequest';
import catchErrors from 'api/controllers/utils/catchErrors';

const getPipelines = (req) => {
  try {
    return JSON.parse(req.query.pipelines);
  } catch (e) {
    throw new Error('Invalid pipelines');
  }
};

const downloadExport = catchErrors(async (req, res) => {
  const pipelines = getPipelines(req);
  const exportId = req.query.exportId;
  const type = req.query.type || null;
  const authInfo = getAuthFromRequest(req);

  const model = await fileService.exportStatements({
    authInfo,
    pipelines,
    exportId,
    type
  });

  return res.status(200).send(model);
});

export default {
  downloadExport
};
