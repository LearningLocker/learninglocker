import { expect } from 'chai';
import { fromJS } from 'immutable';
import Dashboard from 'lib/models/dashboard';
import Organisation from 'lib/models/organisation';
import StatementForwarding from 'lib/models/statementForwarding';
import Visualisation from 'lib/models/visualisation';
import User from 'lib/models/user';
import { update$dteTimezoneInDB } from 'lib/helpers/update$dteTimezoneInDB';

describe('helpers/update$dteTimezoneInDB', () => {
  const query = {
    $and: [
      { timestamp: { $lt: { $dte: '2019-04-17T00:00-08:00' } } },
      { stored: { $gt: { $dte: '2018-11-30T04:00+03:00' } } },
    ],
  };
  const queryString = JSON.stringify(query);

  let organisation;
  let organisation2;
  let dashboard;
  let statementForwarding;
  let statementForwarding2;
  let user;
  let user2;
  let visualisation;
  let visualisation2;

  beforeEach(async () => {
    organisation = await Organisation.create({
      timezone: 'UTC',
    });

    organisation2 = await Organisation.create({
      timezone: 'UTC',
    });

    dashboard = await Dashboard.create({
      organisation: organisation._id,
      shareable: [
        {
          filter: queryString,
          timezone: null,
        },
        {
          filter: queryString,
          timezone: 'Asia/Singapore',
        },
      ],
    });

    statementForwarding = await StatementForwarding.create({
      organisation: organisation._id,
      query: queryString,
      timezone: null,
    });

    statementForwarding2 = await StatementForwarding.create({
      organisation: organisation2._id,
      query: queryString,
      timezone: null,
    });

    user = await User.create({
      email: `${organisation._id.toString()}@learningpool.com`,
      organisations: [organisation._id],
      organisationSettings: [
        {
          organisation: organisation._id,
          filter: queryString,
          timezone: null,
        },
        {
          organisation: organisation2._id,
          filter: queryString,
          timezone: null,
        }
      ],
    });

    user2 = await User.create({
      email: `${organisation2._id.toString()}@learningpool.com`,
      organisations: [organisation2._id],
      organisationSettings: [
        {
          organisation: organisation2._id,
          filter: queryString,
          timezone: null,
        }
      ],
    });

    visualisation = await Visualisation.create({
      organisation: organisation._id,
      filters: [queryString, queryString],
      axesxQuery: queryString,
      axesyQuery: queryString,
      timezone: null,
    });

    visualisation2 = await Visualisation.create({
      organisation: organisation2._id,
      filters: [queryString, queryString],
      axesxQuery: queryString,
      axesyQuery: queryString,
    });
  });

  afterEach(async () => {
    await Promise.all([
      organisation.delete(),
      organisation2.delete(),
      dashboard.delete(),
      statementForwarding.delete(),
      statementForwarding2.delete(),
      user.delete(),
      user2.delete(),
      visualisation.delete(),
      visualisation2.delete(),
    ]);
  });

  it('should update $dte timezone offset', async () => {
    await update$dteTimezoneInDB(organisation._id, 'Asia/Tokyo');

    const updatedDashboard = await Dashboard.findOne({ _id: dashboard._id });
    const updatedDashboardShareableFilter = fromJS(JSON.parse(updatedDashboard.shareable[0].filter));

    expect(updatedDashboardShareableFilter.getIn(['$and', 0, 'timestamp', '$lt', '$dte'])).to.equal('2019-04-17T00:00+09:00');
    expect(updatedDashboardShareableFilter.getIn(['$and', 1, 'stored', '$gt', '$dte'])).to.equal('2018-11-30T04:00+09:00');

    const updatedStatementForwarding = await StatementForwarding.findOne({ _id: statementForwarding._id });
    const updatedStatementForwardingQuery = fromJS(JSON.parse(updatedStatementForwarding.query));

    expect(updatedStatementForwardingQuery.getIn(['$and', 0, 'timestamp', '$lt', '$dte'])).to.equal('2019-04-17T00:00+09:00');
    expect(updatedStatementForwardingQuery.getIn(['$and', 1, 'stored', '$gt', '$dte'])).to.equal('2018-11-30T04:00+09:00');

    const updatedUser = await User.findOne({ _id: user._id });
    const updatedUserOrganisationSettingsFilter = fromJS(JSON.parse(updatedUser.organisationSettings[0].filter));

    expect(updatedUserOrganisationSettingsFilter.getIn(['$and', 0, 'timestamp', '$lt', '$dte'])).to.equal('2019-04-17T00:00+09:00');
    expect(updatedUserOrganisationSettingsFilter.getIn(['$and', 1, 'stored', '$gt', '$dte'])).to.equal('2018-11-30T04:00+09:00');

    const updatedVisualisation = await Visualisation.findOne({ _id: visualisation._id });
    const updatedVisualisationFilter0 = fromJS(JSON.parse(updatedVisualisation.filters[0]));
    const updatedVisualisationFilter1 = fromJS(JSON.parse(updatedVisualisation.filters[1]));
    const updatedVisualisationAxesxQuery = fromJS(JSON.parse(updatedVisualisation.axesxQuery));
    const updatedVisualisationAxesyQuery = fromJS(JSON.parse(updatedVisualisation.axesyQuery));

    expect(updatedVisualisationFilter0.getIn(['$and', 0, 'timestamp', '$lt', '$dte'])).to.equal('2019-04-17T00:00+09:00');
    expect(updatedVisualisationFilter1.getIn(['$and', 0, 'timestamp', '$lt', '$dte'])).to.equal('2019-04-17T00:00+09:00');
    expect(updatedVisualisationAxesxQuery.getIn(['$and', 0, 'timestamp', '$lt', '$dte'])).to.equal('2019-04-17T00:00+09:00');
    expect(updatedVisualisationAxesyQuery.getIn(['$and', 0, 'timestamp', '$lt', '$dte'])).to.equal('2019-04-17T00:00+09:00');

    expect(updatedVisualisationFilter0.getIn(['$and', 1, 'stored', '$gt', '$dte'])).to.equal('2018-11-30T04:00+09:00');
    expect(updatedVisualisationFilter1.getIn(['$and', 1, 'stored', '$gt', '$dte'])).to.equal('2018-11-30T04:00+09:00');
    expect(updatedVisualisationAxesxQuery.getIn(['$and', 1, 'stored', '$gt', '$dte'])).to.equal('2018-11-30T04:00+09:00');
    expect(updatedVisualisationAxesyQuery.getIn(['$and', 1, 'stored', '$gt', '$dte'])).to.equal('2018-11-30T04:00+09:00');
  });

  it('should not update $dte timezone offset if the object has own timezone', async () => {
    // Set statementForwarding timezone
    statementForwarding.timezone = 'CST';
    await statementForwarding.save();

    // Set user organisationSettings timezone
    user.organisationSettings[0].timezone = 'CST';
    await user.save();

    await update$dteTimezoneInDB(organisation._id, 'Asia/Tokyo');

    const updatedDashboard = await Dashboard.findOne({ _id: dashboard._id });
    const updatedDashboardShareableFilter = fromJS(JSON.parse(updatedDashboard.shareable[1].filter));

    expect(updatedDashboardShareableFilter.getIn(['$and', 0, 'timestamp', '$lt', '$dte'])).to.equal('2019-04-17T00:00-08:00');
    expect(updatedDashboardShareableFilter.getIn(['$and', 1, 'stored', '$gt', '$dte'])).to.equal('2018-11-30T04:00+03:00');

    const updatedStatementForwarding = await StatementForwarding.findOne({ _id: statementForwarding._id });
    const updatedStatementForwardingQuery = fromJS(JSON.parse(updatedStatementForwarding.query));

    expect(updatedStatementForwardingQuery.getIn(['$and', 0, 'timestamp', '$lt', '$dte'])).to.equal('2019-04-17T00:00-08:00');
    expect(updatedStatementForwardingQuery.getIn(['$and', 1, 'stored', '$gt', '$dte'])).to.equal('2018-11-30T04:00+03:00');

    const updatedUser = await User.findOne({ _id: user._id });
    const updatedUserOrganisationSettingsFilter = fromJS(JSON.parse(updatedUser.organisationSettings[0].filter));

    expect(updatedUserOrganisationSettingsFilter.getIn(['$and', 0, 'timestamp', '$lt', '$dte'])).to.equal('2019-04-17T00:00-08:00');
    expect(updatedUserOrganisationSettingsFilter.getIn(['$and', 1, 'stored', '$gt', '$dte'])).to.equal('2018-11-30T04:00+03:00');
  });

  it('should not update $dte timezone offset of other than target organisation', async () => {
    await update$dteTimezoneInDB(organisation._id, 'Asia/Tokyo');

    const updatedStatementForwarding2 = await StatementForwarding.findOne({ _id: statementForwarding2._id });
    const updatedStatementForwarding2Query = fromJS(JSON.parse(updatedStatementForwarding2.query));

    expect(updatedStatementForwarding2Query.getIn(['$and', 0, 'timestamp', '$lt', '$dte'])).to.equal('2019-04-17T00:00-08:00');
    expect(updatedStatementForwarding2Query.getIn(['$and', 1, 'stored', '$gt', '$dte'])).to.equal('2018-11-30T04:00+03:00');

    const updatedUser = await User.findOne({ _id: user._id });
    const updatedUserOrganisationSettingsFilter = fromJS(JSON.parse(updatedUser.organisationSettings[1].filter));

    expect(updatedUserOrganisationSettingsFilter.getIn(['$and', 0, 'timestamp', '$lt', '$dte'])).to.equal('2019-04-17T00:00-08:00');
    expect(updatedUserOrganisationSettingsFilter.getIn(['$and', 1, 'stored', '$gt', '$dte'])).to.equal('2018-11-30T04:00+03:00');

    const updatedUser2 = await User.findOne({ _id: user2._id });
    const updatedUserOrganisationSettings2Filter = fromJS(JSON.parse(updatedUser2.organisationSettings[0].filter));

    expect(updatedUserOrganisationSettings2Filter.getIn(['$and', 0, 'timestamp', '$lt', '$dte'])).to.equal('2019-04-17T00:00-08:00');
    expect(updatedUserOrganisationSettings2Filter.getIn(['$and', 1, 'stored', '$gt', '$dte'])).to.equal('2018-11-30T04:00+03:00');
  });

  it('should ignore undefined queries', async () => {
    // Unset axesxQuery
    visualisation.axesxQuery = undefined;
    visualisation.axesyQuery = undefined;
    await visualisation.save();

    await update$dteTimezoneInDB(organisation._id, 'Asia/Tokyo');

    const updatedVisualisation = await Visualisation.findOne({ _id: visualisation._id });

    expect(updatedVisualisation.axesxQuery).to.equal(undefined);
    expect(updatedVisualisation.axesyQuery).to.equal(undefined);
  });
});
