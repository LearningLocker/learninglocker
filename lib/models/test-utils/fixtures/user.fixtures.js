import { ObjectId } from 'mongodb';

export const userFixture = {
  _id: new ObjectId(),
  email: 'test@gmail.com',
  scopes: 'site_admin',
  password: 'test_password_123',
  verified: true
};
