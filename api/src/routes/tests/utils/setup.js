import values from 'lodash/values';
import supertestApi from 'lib/connections/supertestApi';
import { getConnection } from 'lib/connections/mongoose';
import createOrg from 'api/routes/tests/utils/models/createOrg';
import awaitReadyConnection from './awaitReadyConnection';

const connection = getConnection();
const apiApp = supertestApi();
const deleteAllData = async () => {
  await Promise.all(values(connection.models).map(model => model.deleteMany({})));
};
export default () => {
  before(async () => {
    await awaitReadyConnection(connection);
    await deleteAllData();
  });

  beforeEach('Set up organisation for testing', async () => {
    await Promise.all([createOrg()]);
  });

  afterEach('Clear db collections', deleteAllData);

  return apiApp;
};
