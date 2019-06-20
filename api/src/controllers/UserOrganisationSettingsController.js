import catchErrors from 'api/controllers/utils/catchErrors';

const createOrganisationSetting = catchErrors(async (req, res) => {
  console.log('controller');
  res.status(200).send('');
});

const updateOrganisationSetting = catchErrors(async (req, res) => {
  res.status(200).send('');
});

const deleteOrganisationSetting = catchErrors(async (req, res) => {
  res.status(200).send('');
});

const UserOrganisationSettingsController = {
  create: createOrganisationSetting,
  update: updateOrganisationSetting,
  delete: deleteOrganisationSetting,
};

export default UserOrganisationSettingsController;
