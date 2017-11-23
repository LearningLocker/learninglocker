import { createDashboardJWT } from 'api/auth/jwt';
import createDashboard from 'api/routes/tests/utils/models/createDashboard';

export default async ({ visualisationIds = [] } = {}) => {
  const dashboard = await createDashboard({
    widgets: visualisationIds.map(_id => ({ title: `Visualisation: ${_id.toString()}`, visualisation: _id }))
  });
  const token = await createDashboardJWT(dashboard, 'native');
  return token;
};
