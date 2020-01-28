import User from '../user';
import { userFixture } from './fixtures/user.fixtures';
import Organisation from '../organisation';
import { orgFixture } from './fixtures/organisation.fixtures';

export const createUser = async () =>
  await new User(userFixture).save();

export const createOrganisation = async () =>
  await new Organisation(orgFixture).save();
