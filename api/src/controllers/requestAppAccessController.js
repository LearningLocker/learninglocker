import fs from 'fs';
import htmlToText from 'html-to-text';
import { defaultMailOptions, sendHandler } from 'lib/helpers/email';
import transporter from 'lib/connections/nodemailer';
import _ from 'lodash';
import { promisify } from 'bluebird';
import getAuthFromRequest from 'lib/helpers/getAuthFromRequest';

export const requestAppAccess = async (request, response) => {
  const authInfo = getAuthFromRequest(request);

  const subject = 'Upgrade to enterprise enquiry';
  const recipient = 'Lydia Ross <lydia.ross@learningpool.com>'; // TODO: hello@learninglocker.net

  const globalTemplate = await promisify(fs.readFile)('./lib/templates/emails/body.html');
  const compiledWrapper = _.template(globalTemplate);
  const subTemplate = await promisify(fs.readFile)('./lib/templates/emails/requestAppAccess.html');
  const compiledContent = _.template(subTemplate);

  const content = compiledContent({
    email: authInfo.user.email,
    orgId: authInfo.token.tokenId,
    llHost: request.headers.host,
    appName: request.body.appName,
    privacyPolicy: request.body.privacyPolicy
  });

  const htmlEmail = compiledWrapper({ title: subject, body: content, siteUrl: process.env.SITE_URL });
  const text = htmlToText.fromString(content);

  const mailOptions = _.defaults({
    to: recipient,
    subject,
    html: htmlEmail,
    text,
  }, defaultMailOptions);


  await transporter.sendMail(mailOptions, sendHandler);
  response.send();
};

export default { requestAppAccess };
