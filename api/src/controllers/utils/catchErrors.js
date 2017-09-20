import handleError from 'api/controllers/utils/handleError';

export default handler => async (req, res) => {
  try {
    await handler(req, res);
  } catch (err) {
    return handleError(res, err);
  }
};
