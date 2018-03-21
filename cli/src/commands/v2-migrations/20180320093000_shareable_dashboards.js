import Dashboard from 'lib/models/dashboard';
import { map } from 'lodash';

const up = async () => {
  const dashboards = await Dashboard.find({}).exec();

  const updatePromises = map(dashboards, (dashboard) => {
    if (!dashboard.shareable) {
      dashboard.shareable = [];
    }

    dashboard.shareable.unshift({
      title: '~ Shareable',
      filter: dashboard.filter,
      visability: dashboard.visability,
      validDomains: dashboard.validDomains
    });

    dashboard.filter = undefined;
    dashboard.visability = undefined;
    dashboard.validDomains = undefined;

    return dashboard.save();
  });

  await Promise.all(updatePromises);
};

const down = async () => {
  console.log('Unimplemented');
};

export default { up, down };
