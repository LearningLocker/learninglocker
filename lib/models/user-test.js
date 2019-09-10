import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { Error } from 'mongoose';
import User from './user';

chai.use(chaiAsPromised);

describe('user model', () => {
  beforeEach(async () => {
    await User.remove({});
  });

  it('should not throw a ValidationError when email is unique', async () => {
    await User.create({
      email: 'user-1@learningpool.com',
    });

    const user2 = await User.create({
      email: 'user-2@learningpool.com',
    });

    user2.email = 'user-2-new@learningpool.com';
    await expect(user2.save()).to.eventually.not.be.rejected;
  });

  it('should throw a ValidationError when email already exists', async () => {
    await User.create({
      email: 'user-1@learningpool.com',
    });

    const user2 = await User.create({
      email: 'user-2@learningpool.com',
    });

    user2.email = 'user-1@learningpool.com';
    await expect(user2.save()).to.eventually.be.rejectedWith(Error.ValidationError);
  });

  it('should not throw a ValidationError when password is valid', async () => {
    const f = User.create({
      email: 'user-1@learningpool.com',
      password: 'xxxxxxx1',
    });

    await expect(f).to.eventually.not.be.rejected;
  });

  it('should not throw a ValidationError when password is empty', async () => {
    const f = User.create({
      email: 'user-1@learningpool.com',
      password: '',
    });

    await expect(f).to.eventually.not.be.rejected;
  });

  it('should throw a ValidationError when password length is smaller than 8', async () => {
    const f = User.create({
      email: 'user-1@learningpool.com',
      password: 'xxxxxx1',
    });

    await expect(f).to.eventually.be.rejectedWith(Error.ValidationError);
  });

  it('should throw a ValidationError when password does not have number', async () => {
    const f = User.create({
      email: 'user-1@learningpool.com',
      password: 'xxxxxxxx',
    });

    await expect(f).to.eventually.be.rejectedWith(Error.ValidationError);
  });

  it('should throw a ValidationError when password does not have alphabet', async () => {
    const f = User.create({
      email: 'user-1@learningpool.com',
      password: '12345678',
    });

    await expect(f).to.eventually.be.rejectedWith(Error.ValidationError);
  });

  it('should throw a ValidationError when password is in password history', async () => {
    const user = await User.create({
      email: 'user-1@learningpool.com',
      password: 'password_001',
    });

    user.password = 'password_002';
    await user.save();

    user.password = 'password_003';
    await user.save();

    user.password = 'password_001';
    await expect(user.save()).to.eventually.be.rejectedWith(Error.ValidationError);
  });

  it('should not throw a ValidationError when password is not in recent password history', async () => {
    // PASSWORD_HISTORY_TOTAL is 3.
    const user = await User.create({
      email: 'user-1@learningpool.com',
      password: 'password_001',
    });

    user.password = 'password_002';
    await user.save();

    user.password = 'password_003';
    await user.save();

    user.password = 'password_004';
    await user.save();

    user.password = 'password_001';
    await expect(user.save()).to.eventually.not.be.rejected;
  });
});
