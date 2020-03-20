import User from 'lib/models/user';
import { SITE_ADMIN, ALL } from 'lib/constants/scopes';
import { MANAGE_ALL_USERS } from 'lib/constants/orgScopes';
import NotFoundError from 'lib/errors/NotFoundError';
import ClientError from 'lib/errors/ClientError';
import catchErrors from 'api/controllers/utils/catchErrors';

const createOrganisationSetting = catchErrors(async (req, res) => {
  const user = await User.findOne({ _id: req.params.userId });
  if (!user) {
    throw new NotFoundError();
  }

  const alreadyExists = user.organisationSettings.some(s => s.organisation.toString() === req.params.organisationId);
  if (alreadyExists) {
    throw new ClientError(`Duplicated: The user already has the organisationSettings for the organisation (${req.params.organisationId})`);
  }

  // Should we set organisation required parameter?
  if (req.body.organisation === undefined) {
    req.body.organisation = req.params.organisationId;
  }

  if (req.params.organisationId !== req.body.organisation) {
    throw new ClientError(`Invalid: organisationId in URL path (${req.params.organisationId}) and organisation in body (${req.body.organisation}) are not matched.`);
  }

  user.organisationSettings.push(req.body);
  const updatedUser = await user.save();
  const insertedOrganisationSetting = updatedUser.organisationSettings.find(s => s.organisation.toString() === req.params.organisationId);
  res.status(200).send(insertedOrganisationSetting);
});

/**
 * @param {object} body
 * @param {string[]} scopes
 * @returns {boolean}
 */
const validateUpdatableKeys = (body, scopes) => {
  if (scopes.includes(SITE_ADMIN)) {
    return true;
  }

  const updatingKeys = Object.keys(body);

  if (scopes.some(s => [MANAGE_ALL_USERS, ALL].includes(s))) {
    return updatingKeys.every(key => ['filter', 'roles', 'scopes'].includes(key));
  }

  return updatingKeys.every(key => ['samlEnabled'].includes(key));
};

const updateOrganisationSetting = catchErrors(async (req, res) => {
  const user = await User.findOne({ _id: req.params.userId });
  if (!user) {
    throw new NotFoundError();
  }

  const scopes = req.user.authInfo.token.scopes;
  const isValid = validateUpdatableKeys(req.body, scopes);
  if (!isValid) {
    throw new ClientError('Can not update some fields you are trying to update');
  }

  if (req.body.organisation && req.params.organisationId !== req.body.organisation) {
    throw new ClientError(`Invalid: organisationId in URL path (${req.params.organisationId}) and organisation in body (${req.body.organisation}) are not matched.`);
  }

  const i = user.organisationSettings.findIndex(s => s.organisation.toString() === req.params.organisationId);
  if (i < 0) {
    user.organisationSettings.push({
      organisation: req.params.organisationId,
      ...req.body,
    });
  } else {
    user.organisationSettings[i] = {
      ...user.organisationSettings[i].toObject(),
      ...req.body,
    };
  }

  const updatedUser = await user.save();
  const insertedOrganisationSetting = updatedUser.organisationSettings[i];

  res.status(200).send(insertedOrganisationSetting);
});


const deleteOrganisationSetting = catchErrors(async (req, res) => {
  const user = await User.findOne({ _id: req.params.userId });
  if (!user) {
    throw new NotFoundError();
  }

  user.organisationSettings = user.organisationSettings.filter(s => s.organisation.toString() !== req.params.organisationId);
  await user.save();
  res.status(200).send();
});

const UserOrganisationSettingsController = {
  create: createOrganisationSetting,
  update: updateOrganisationSetting,
  delete: deleteOrganisationSetting,
};

export default UserOrganisationSettingsController;
