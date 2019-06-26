import Organisation from 'lib/models/organisation';
import User from 'lib/models/user';
import NotFoundError from 'lib/errors/NotFoundError';
import catchErrors from 'api/controllers/utils/catchErrors';

const addOrganisationToUser = catchErrors(async (req, res) => {
  const user = await User.findOne({ _id: req.params.userId });
  if (!user) {
    throw new NotFoundError(`Not found user (_id: ${req.params.userId})`);
  }

  const organisation = await Organisation.findOne({ _id: req.params.organisationId });
  if (!organisation) {
    throw new NotFoundError(`Not found organisation (_id: ${req.params.organisationId})`);
  }

  user.organisations = Array.from(new Set(user.organisations).add(req.params.organisationId));
  await user.save();
  res.status(200).send();
});

const removeOrganisationFromUser = catchErrors(async (req, res) => {
  const user = await User.findOne({ _id: req.params.userId });
  if (!user) {
    throw new NotFoundError(`Not found user (_id: ${req.params.userId})`);
  }

  const userOrganisationSet = new Set(user.organisations.map(o => o.toString()));
  userOrganisationSet.delete(req.params.organisationId);
  user.organisations = Array.from(userOrganisationSet);

  await user.save();
  res.status(200).send();
});

const UserOrganisationsController = {
  create: addOrganisationToUser,
  delete: removeOrganisationFromUser,
};

export default UserOrganisationsController;
