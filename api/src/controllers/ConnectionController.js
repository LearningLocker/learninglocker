import getJSONFromQuery from 'api/utils/getJSONFromQuery';
import getFromQuery from 'api/utils/getFromQuery';
import getAuthFromRequest from 'lib/helpers/getAuthFromRequest';
import catchErrors from 'api/controllers/utils/catchErrors';

export default model =>
  catchErrors(async (req, res) => {
    const { before, after } = req.query;
    const filter = getJSONFromQuery(req, 'filter', {});
    const sort = getJSONFromQuery(req, 'sort', { _id: 1 });
    const hint = getJSONFromQuery(req, 'hint', undefined);
    const project = getJSONFromQuery(req, 'project', undefined);
    const first = getFromQuery(req, 'first', undefined, parseInt);
    const last = getFromQuery(req, 'last', undefined, parseInt);
    const authInfo = getAuthFromRequest(req);

    const connection = await model.getConnection({
      authInfo,
      filter,
      sort,
      before,
      after,
      first,
      last,
      hint,
      project
    });
    return res.status(200).send(connection);
  });
