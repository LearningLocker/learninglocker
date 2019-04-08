import Dashboard from 'lib/models/dashboard';
import testId from 'api/routes/tests/utils/testId';
import ownerId from 'api/routes/tests/utils/ownerId';
import Widget from 'ui/containers/Widget';

export default (opts = { _id: testId }) =>
  Dashboard.create({
    name: 'Test dashboard',
    owner: ownerId,
    organisation: testId,
    widget: Widget,
    ...opts
  });
