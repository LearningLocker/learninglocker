import User from '../user';
import Organisation from '../organisation';

export const createUser = async user =>
  await new User(user).save();

export const createOrganisation = async organisation =>
  await new Organisation(organisation).save();
