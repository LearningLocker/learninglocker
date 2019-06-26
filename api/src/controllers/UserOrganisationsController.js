import User from 'lib/models/user';
import NotFoundError from 'lib/errors/NotFoundError';
import catchErrors from 'api/controllers/utils/catchErrors';

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
  delete: removeOrganisationFromUser,
};

export default UserOrganisationsController;
