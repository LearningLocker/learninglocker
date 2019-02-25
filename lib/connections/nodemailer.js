import boolean from 'boolean';
import defaultTo from 'lodash/defaultTo';
import logger from 'lib/logger';
import nodemailer from 'nodemailer';

const smtpConfig = {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: boolean(defaultTo(process.env.SMTP_SECURED, false)),
  ignoreTLS: boolean(defaultTo(process.env.SMTP_IGNORE_TLS, false)),
  requireTLS: boolean(defaultTo(process.env.SMTP_REQUIRE_TLS, false))
};

// Placed like this since the boolean set default can be hard to read in an if condition.
const sendAuthRequest = boolean(defaultTo(process.env.SMTP_AUTH_REQUEST, true));

// Do not want the auth object in the smtpConfig object if sendAuthRequest is false, default is true.
if (sendAuthRequest) {
  Object.assign(smtpConfig, {
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

let mailer; //eslint-disable-line

if (process.env.TESTING) {
  mailer = {
    sendMail: (opts) => {
      // @TODO: this is quite annoying when pumped into the stdout during testing
      // better solution?
      logger.debug(`Pretending to email ${opts.to}`);
    }
  };
} else {
  mailer = nodemailer.createTransport(smtpConfig);
}

export default mailer;
