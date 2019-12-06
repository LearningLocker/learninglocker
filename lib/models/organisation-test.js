import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { Error } from 'mongoose';
import Organisation from './organisation';

chai.use(chaiAsPromised);

describe('organisation model', () => {
  it('should not throw a ValidationError when settings.LOCKOUT_ATTEMPS is larger than 0', async () => {
    const f = Organisation.create({
      settings: {
        LOCKOUT_ATTEMPS: 1,
      },
    });

    await expect(f).to.eventually.not.be.rejected;
  });

  it('should throw a ValidationError when settings.LOCKOUT_ATTEMPS is 0', async () => {
    const f = Organisation.create({
      settings: {
        LOCKOUT_ATTEMPS: 0,
      },
    });

    await expect(f).to.eventually.be.rejectedWith(Error.ValidationError, 'A user should be allowed at least one attempt');
  });

  it('should not throw a ValidationError when settings.LOCKOUT_SECONDS is 5', async () => {
    const f = Organisation.create({
      settings: {
        LOCKOUT_SECONDS: 5,
      },
    });

    await expect(f).to.eventually.not.be.rejected;
  });

  it('should throw a ValidationError when settings.LOCKOUT_SECONDS is smaller 5', async () => {
    const f = Organisation.create({
      settings: {
        LOCKOUT_SECONDS: 4,
      },
    });

    await expect(f).to.eventually.be.rejectedWith(Error.ValidationError, 'Must be at least 5 seconds');
  });

  it('should not throw a ValidationError when settings.PASSWORD_HISTORY_TOTAL is 1', async () => {
    const f = Organisation.create({
      settings: {
        PASSWORD_HISTORY_TOTAL: 1,
      },
    });

    await expect(f).to.eventually.not.be.rejected;
  });

  it('should throw a ValidationError when settings.PASSWORD_HISTORY_TOTAL is smaller 1', async () => {
    const f = Organisation.create({
      settings: {
        PASSWORD_HISTORY_TOTAL: 0,
      },
    });

    await expect(f).to.eventually.be.rejectedWith(Error.ValidationError, 'At least one password must be stored and checked with this setting enabled');
  });

  it('should not throw a ValidationError when settings.PASSWORD_CUSTOM_REGEX is valid', async () => {
    const f = Organisation.create({
      settings: {
        PASSWORD_USE_CUSTOM_REGEX: true,
        PASSWORD_CUSTOM_REGEX: 'a',
      },
    });

    await expect(f).to.eventually.not.be.rejected;
  });

  it('should throw a ValidationError when settings.PASSWORD_CUSTOM_REGEX is invalid', async () => {
    const f = Organisation.create({
      settings: {
        PASSWORD_USE_CUSTOM_REGEX: true,
        PASSWORD_CUSTOM_REGEX: {},
      },
    });

    await expect(f).to.eventually.be.rejectedWith(Error.ValidationError);
  });

  it('should not throw a ValidationError when settings.PASSWORD_MIN_LENGTH is 4', async () => {
    const f = Organisation.create({
      settings: {
        PASSWORD_MIN_LENGTH: 4,
      },
    });

    await expect(f).to.eventually.not.be.rejected;
  });

  it('should throw a ValidationError when settings.PASSWORD_MIN_LENGTH is smaller than 4', async () => {
    const f = Organisation.create({
      settings: {
        PASSWORD_MIN_LENGTH: 3,
      },
    });

    await expect(f).to.eventually.be.rejectedWith(Error.ValidationError);
  });
});
