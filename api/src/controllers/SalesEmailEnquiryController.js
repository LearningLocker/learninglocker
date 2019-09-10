import fs from 'fs';
import htmlToText from 'html-to-text';
import { defaultMailOptions, sendHandler } from 'lib/helpers/email';
import transporter from 'lib/connections/nodemailer';
import _ from 'lodash';

export const sendEmail = (request, response) => {
  try {
    const subject = 'Upgrade to enterprise enquiry';
    const recipient = 'Lydia Ross <lydia.ross@learningpool.com>'; // TODO: hello@ht2labs.com

    fs.readFile('./lib/templates/emails/body.html', (err, wrapperHtml) => {
      const compiledWrapper = _.template(wrapperHtml);
      fs.readFile('./lib/templates/emails/upgradeToEnterprise.html', (err, contentHtml) => {
        if (err) {
          throw err;
        }

        const compiledContent = _.template(contentHtml);
        const content = compiledContent({
          fullName: request.body.fullName,
          company: request.body.company,
          email: request.body.email,
          mailingList: request.body.mailingList,
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

        transporter.sendMail(mailOptions, sendHandler);
      });
    });
    response.send();
  } catch (err) {
    throw err;
  }
};

export default { sendEmail };
