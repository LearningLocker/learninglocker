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
  const recipient = 'Learning Locker <lydia.ross@learningpool.com>';

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
    transporter.sendMail(mailOptions, (error, info) => {
      console.log('001', error);
      if (error !== null && error !== undefined) {
        console.log('002', error.responseCode);
        logger.error('Error sending email', error);
        reject(new RequestAppAccessError());
        return;
      }
      console.log('003 - success', info);
      resolve();
    });
  });
  response.send();
});

export default { requestAppAccess };
