import mongoose from 'mongoose';
import { createDashboardJWT } from 'api/auth/jwt';
import createDashboard from 'api/routes/tests/utils/models/createDashboard';

const objectId = mongoose.Types.ObjectId;

export default async ({ visualisationIds = [] } = {}) => {
  const shareableId = objectId();
  const dashboard = await createDashboard({
    widgets: visualisationIds.map(_id => ({ title: `Visualisation: ${_id.toString()}`, visualisation: _id })),
    shareable: [{
      _id: shareableId,
      filter: '{}'
    }]
  });
  const token = await createDashboardJWT(dashboard, shareableId.toString(), 'native');
  return token;
};
