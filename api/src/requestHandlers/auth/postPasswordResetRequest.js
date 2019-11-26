import logger from 'lib/logger';
import User from 'lib/models/user';
import { sendResetPasswordToken } from 'lib/helpers/email';

/**
 * Generate and email a password reset token to a user through their email
 * @param {Express.Request} req  The request
 * @param {Express.Response} res  The response object
 * @param {Function} next
 * @return {Promise<void>} HTTP 204 No Content on success
 */
export default async function postPasswordResetRequest(req, res, next) {
  const { email } = req.body;
  User.findOne({ email }, (findErr, user) => {
    if (findErr) {
      return next(findErr);
    }

    if (!user) {
      return res.status(204).send();
    }

    return user.createResetToken((token) => {
      user.resetTokens.push(token);
      user.save((err) => {
        if (err) {
          logger.error('Password reset error', err);
          return res.status(500).send({ message: 'There was an issue. Please try again' });
        }

        // @TODO: send status based on outcome of send!!
        sendResetPasswordToken(user, token);

        return res.status(204).send();
      });
    });
  });
}
