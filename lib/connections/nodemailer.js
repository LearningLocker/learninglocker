import logger from 'lib/logger';
import nodemailer from 'nodemailer';

const smtpConfig = {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
};

let mailer; //eslint-disable-line

if (process.env.TESTING) {
  mailer = { sendMail: (opts) => {
    // @TODO: this is quite annoying when pumped into the stdout during testing
    // better solution?
    logger.debug(`Pretending to email ${opts.to}`);
  } };
} else {
  mailer = nodemailer.createTransport(smtpConfig);
}

export default mailer;
