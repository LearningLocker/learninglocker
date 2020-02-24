import logger from 'lib/logger';
import transporter from 'lib/connections/nodemailer';
import _ from 'lodash';
import defaultTo from 'lodash/defaultTo';
import fs from 'fs';
import htmlToText from 'html-to-text';
import moment from 'moment';
import { promisify } from 'bluebird';

export const defaultMailOptions = {
  from: `${defaultTo(process.env.LL_FROM_NAME, 'Learning Locker')} ` +
    `<${defaultTo(process.env.LL_FROM_EMAIL, 'noreply@learninglocker.net')}>`
};

const siteUrl = () =>
  process.env.SITE_URL
  ;

const sendHandler = (error, info) => {
  if (error) {
    logger.error('Error sending email', error);
  } else {
    logger.debug('Email send attempt', info);
  }
  // @TODO: Handle email sends - do we offer receipts for these?
};

const toFormatter = (user) => {
  const name = user.name || user.email;
  return `${name} <${user.email}>`;
};

export const sendNewUser = (user, token) => {
  const subject = 'You have been invited into an organisation in Learning Locker';
  const resetLink = `${siteUrl()}/reset/?email=${encodeURIComponent(user.email)}&token=${encodeURIComponent(token.token)}`;

  fs.readFile('./lib/templates/emails/body.html', (err, wrapperHtml) => {
    const compiledWrapper = _.template(wrapperHtml);
    fs.readFile('./lib/templates/emails/newUserReset.html', (err, contentHtml) => {
      if (err) {
        throw err;
      }

      const compiledContent = _.template(contentHtml);
      const content = compiledContent({ resetLink });

      const htmlEmail = compiledWrapper({ title: subject, body: content, siteUrl: process.env.SITE_URL });
      const text = htmlToText.fromString(content);

      const mailOptions = _.defaults({
        to: toFormatter(user),
        subject,
        html: htmlEmail,
        text,
      }, defaultMailOptions);

      transporter.sendMail(mailOptions, sendHandler);
    });
  });
};

export const sendOrganisationAboutToExpire = async (user, organisation) => {
  const subject = `The ${organisation.name} organisation is going to expire on ${moment(organisation.expiration).format()} on Learning Locker`;

  const globalTemplate = await promisify(fs.readFile)('./lib/templates/emails/body.html');
  const compiledWrapper = _.template(globalTemplate);
  const subTemplate = await promisify(fs.readFile)('./lib/templates/emails/organisationAboutToExpire.html');

  const compiledContent = _.template(subTemplate);

  const content = compiledContent({
    name: organisation.name,
    expiration: moment(organisation.expiration).format()
  });
  const htmlEmail = compiledWrapper({ title: subject, body: content, siteUrl: process.env.SITE_URL });
  const text = htmlToText.fromString(content);

  const mailOptions = _.defaults({
    to: toFormatter(user),
    subject,
    html: htmlEmail,
    text
  }, defaultMailOptions);

  transporter.sendMail(mailOptions, sendHandler);
};

export const sendOrganisationExpired = async (user, organisation) => {
  const subject = `The ${organisation.name} organisation has expired on Learning Locker`;

  const globalTemplate = await promisify(fs.readFile)('./lib/templates/emails/body.html');
  const compiledWrapper = _.template(globalTemplate);
  const subTemplate = await promisify(fs.readFile)('./lib/templates/emails/organisationExpired.html');

  const compiledContent = _.template(subTemplate);

  const content = compiledContent({
    name: organisation.name,
  });
  const htmlEmail = compiledWrapper({ title: subject, body: content, siteUrl: process.env.SITE_URL });
  const text = htmlToText.fromString(content);

  const mailOptions = _.defaults({
    to: toFormatter(user),
    subject,
    html: htmlEmail,
    text
  }, defaultMailOptions);

  transporter.sendMail(mailOptions, sendHandler);
};

export const sendResetPasswordToken = (user, token) => {
  const subject = 'Request to reset your password';
  const resetLink = `${siteUrl()}/reset?email=${encodeURIComponent(user.email)}&token=${encodeURIComponent(token.token)}`;

  fs.readFile('./lib/templates/emails/body.html', (err, wrapperHtml) => {
    const compiledWrapper = _.template(wrapperHtml);
    fs.readFile('./lib/templates/emails/requestPasswordReset.html', (err, contentHtml) => {
      if (err) {
        throw err;
      }

      const compiledContent = _.template(contentHtml);
      const content = compiledContent({ user: user.name, resetLink });

      const htmlEmail = compiledWrapper({ title: subject, body: content, siteUrl: process.env.SITE_URL });
      const text = htmlToText.fromString(content);

      const mailOptions = _.defaults({
        to: toFormatter(user),
        subject,
        html: htmlEmail,
        text,
      }, defaultMailOptions);

      transporter.sendMail(mailOptions, sendHandler);
    });
  });
};
