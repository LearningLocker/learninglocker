import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';
import Dashboard, { schema } from 'lib/models/dashboard';

import { map } from 'lodash';

const objectId = mongoose.Types.ObjectId;

schema.set('strict', false);
const OldDashboardModel = getConnection().model('Dashboard', schema, 'dashboards');

const up = async () => {
  const dashboards = await Dashboard.find({}).exec();

  const updatePromises = map(dashboards, async (dashboard) => {
    if (!dashboard.shareable) {
      dashboard.shareable = [];
    }

    dashboard.shareable.unshift({
      title: '~ Shareable',
      filter: dashboard.filter,
      visability: dashboard.visability,
      validDomains: dashboard.validDomains
    });

    console.log('id ', dashboard._id);

    return dashboard.save();
  });

  await Promise.all(updatePromises);

  const result = await OldDashboardModel.update(
    {},
    {
      $unset: { filter: true, visibility: true, validDomains: true },
    },
    {
      multi: true,
      safe: false,
      strict: false
    }
  );
  console.log('result', result);
};

const down = async () => {
  console.log('Unimplemented');

  const dashboards = await OldDashboardModel.find({}).exec();

  const updatePromises = map(dashboards, (dashboard) => {
    if (!dashboard.shareable || dashboard.shareable.length <= 1) {
      return Promise.resolve();
    }

    const shareable = dashboard.shareable.shift();

    return OldDashboardModel.update(
      { _id: objectId(dashboard._id) },
      {
        filter: shareable.filter,
        visability: shareable.visability,
        validDomains: shareable.validDomains,
        shareable
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
