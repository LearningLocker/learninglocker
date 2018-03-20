import handleRequestError from 'api/controllers/utils/handleRequestError';

export default handler => async (req, res) => {
  try {
    await handler(req, res);
  } catch (err) {
    return handleRequestError(res, err);
  }
};
