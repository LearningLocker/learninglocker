import fs from 'fs';
import htmlToText from 'html-to-text';
import { defaultMailOptions } from 'lib/helpers/email';
import transporter from 'lib/connections/nodemailer';
import _ from 'lodash';
import { promisify } from 'bluebird';
import RequestAppAccessError from 'lib/errors/RequestAppAccessError';
import getAuthFromRequest from 'lib/helpers/getAuthFromRequest';
import logger from 'lib/logger';
import catchErrors from './utils/catchErrors';

export const requestAppAccess = catchErrors(async (request, response) => {
  const authInfo = getAuthFromRequest(request);

  const subject = 'Upgrade to enterprise enquiry';
  const recipient = 'Learning Locker <hello@learninglocker.net>';

  const globalTemplate = await promisify(fs.readFile)('./lib/templates/emails/body.html');
  const compiledWrapper = _.template(globalTemplate);
  const subTemplate = await promisify(fs.readFile)('./lib/templates/emails/requestAppAccess.html');
  const compiledContent = _.template(subTemplate);

  const content = compiledContent({
    email: authInfo.user.email,
    orgId: authInfo.token.tokenId,
    llHost: request.headers.host,
    appConfig: JSON.stringify(request.body.appConfig),
  });

  const htmlEmail = compiledWrapper({ title: subject, body: content, siteUrl: process.env.SITE_URL });
  const text = htmlToText.fromString(content);

  const mailOptions = _.defaults({
    to: recipient,
    subject,
    html: htmlEmail,
    text,
  }, defaultMailOptions);

  await new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (err) => {
      if (err !== null && err !== undefined) {
        logger.error('Error sending email', err);
        reject(new RequestAppAccessError());
        return;
      }
      resolve();
    });
  });
  response.send();
});

export default { requestAppAccess };
