import logger from 'lib/logger';
import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';
import Dashboard, { schema } from 'lib/models/dashboard';

import { map } from 'lodash';

const objectId = mongoose.Types.ObjectId;

schema.set('strict', false);
const OldDashboardModel = getConnection().model('Dashboard', schema, 'dashboards');

const up = async () => {
  logger.info('Moving existing shared dashboards into new array format.');
  const dashboards = await Dashboard.find({}).lean().exec();

  const updatePromises = map(dashboards, async (dashboard) => {
    if (!dashboard.shareable) {
      dashboard.shareable = [];
    }

    const shareable = dashboard.shareable;
    shareable.unshift({
      title: '~ Shareable',
      filter: dashboard.filter,
      visibility: dashboard.visibility,
      validDomains: dashboard.validDomains,
      createdAt: new Date(),
    });

    return OldDashboardModel.updateOne(
      { _id: objectId(dashboard._id) },
      {
        shareable,
      },
      {
        safe: false,
        strict: false
      }
    );
  });

  await Promise.all(updatePromises);
};

const down = async () => {
  logger.info('Moving first shared link in dashboards back into old format.');
  const dashboards = await OldDashboardModel.find({}).exec();

  const updatePromises = map(dashboards, (dashboard) => {
    if (!dashboard.shareable || dashboard.shareable.length < 1) {
      return Promise.resolve();
    }

    const shareable = dashboard.shareable.shift();

    return OldDashboardModel.updateOne(
      { _id: objectId(dashboard._id) },
      {
        filter: shareable.filter,
        visibility: shareable.visibility,
        validDomains: shareable.validDomains,
        shareable: dashboard.shareable,
      },
      {
        safe: false,
        strict: false
      }
    );
  });

  await Promise.all(updatePromises);
};

export default { up, down };
