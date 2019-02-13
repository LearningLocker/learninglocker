import Organisation, { EMAIL_PROCESSING, EMAIL_NOOP } from 'lib/models/organisation';
import moment from 'moment';
import { expect } from 'chai';
import {
  WEEK_BEFORE_NOTIFICATION,
  EXPIRATION_NOTIFICATION
} from 'lib/constants/expirationNotifications';
import expirationNotificationEmails from './expirationNotificationEmails';

describe('expirationNotificationEmails', () => {
  beforeEach(async () => {
    await Organisation.deleteMany({});
  });

  it('should send weekBefore email', async () => {
    const organisation = await Organisation.create({
      expiration: moment().add(1, 'day').toDate()
    });

    let publishCalled = false;
    await expirationNotificationEmails({
      publish: ({
        payload
      }) => {
        publishCalled = true;
        expect(payload.organisationId).to.equal(organisation._id.toString());
        expect(payload.emailType).to.equal(WEEK_BEFORE_NOTIFICATION);
      },
      dontExit: true
    });

    expect(publishCalled).to.equal(true);

    const newOrg = await Organisation.findById(organisation._id);
    expect(newOrg.expirationNotifications.weekBeforeNotificationSent).to.equal(EMAIL_PROCESSING);
    expect(newOrg.expirationNotifications.expirationNotificationSent).to.equal(EMAIL_NOOP);
  });

  it('should not send any email', async () => {
    const organisation = await Organisation.create({
      expiration: moment().add(9, 'day').toDate()
    });

    let publishCalled = false;
    await expirationNotificationEmails({
      publish: () => {
        publishCalled = true;
      },
      dontExit: true
    });

    expect(publishCalled).to.equal(false);

    const newOrg = await Organisation.findById(organisation._id);
    expect(newOrg.expirationNotifications.weekBeforeNotificationSent).to.equal(EMAIL_NOOP);
    expect(newOrg.expirationNotifications.expirationNotificationSent).to.equal(EMAIL_NOOP);
  });

  it('should send expiration email', async () => {
    const organisation = await Organisation.create({
      expiration: moment().subtract(1, 'day').toDate()
    });

    let publishCalled = false;
    await expirationNotificationEmails({
      publish: ({
        payload
      }) => {
        publishCalled = true;
        expect(payload.organisationId).to.equal(organisation._id.toString());
        expect(payload.emailType).to.equal(EXPIRATION_NOTIFICATION);
      },
      dontExit: true
    });

    expect(publishCalled).to.equal(true);

    const newOrg = await Organisation.findById(organisation._id);
    expect(newOrg.expirationNotifications.weekBeforeNotificationSent).to.equal(EMAIL_NOOP);
    expect(newOrg.expirationNotifications.expirationNotificationSent).to.equal(EMAIL_PROCESSING);
  });
});
