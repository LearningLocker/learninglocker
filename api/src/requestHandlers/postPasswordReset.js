import User from 'lib/models/user';

/**
 * Reset a users password with a valid password reset token
 * @param {Express.Request} req  The request
 * @param {Express.Response} res  The response object
 * @param {Function} next
 * @return {Promise<void>} HTTP 200 OK on success
 */
export async function postPasswordReset(req, res, next) {
  const { email, token, password } = req.body;
  const now = new Date();

  if (password.length === 0) {
    return res.status(400).send({ message: 'You must enter a password' });
  }

  return User.findOne(
    {
      email,
      'resetTokens.token': token,
      'resetTokens.expires': { $gt: now }
    },
    (err, user) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(404).send({
          message: 'Invalid password reset token. Please submit a new request'
        });
      }

      // clear the reset tokens, any lockouts and save the password
      // (hashing and validation will need to take place)
      user.resetTokens = [];
      user.password = password;

      // save the user
      return user.save((err, savedUser) => {
        // validation errors may get thrown here, return the error message
        if (err) {
          if (err.statusCode) {
            res.status(err.statusCode);
          } else {
            res.status(400);
          }
          return res.send(err);
        }

        // return the saved user
        return res.send(savedUser);
      });
    }
  );
}
