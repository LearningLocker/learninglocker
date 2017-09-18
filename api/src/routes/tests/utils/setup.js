import values from 'lodash/values';
import supertestApi from 'lib/connections/supertestApi';
import { getConnection } from 'lib/connections/mongoose';
import createOrg from 'api/routes/tests/utils/models/createOrg';
import awaitReadyConnection from './awaitReadyConnection';

const connection = getConnection();
const apiApp = supertestApi();

export default () => {
  before(async () => {
    await awaitReadyConnection(connection);
  });

  beforeEach('Set up organisation for testing', async () => {
    await Promise.all([createOrg()]);
  });

  afterEach('Clear db collections', async () => {
    await Promise.all(values(connection.models).map(model => model.remove({})));
  });

  return apiApp;
};
