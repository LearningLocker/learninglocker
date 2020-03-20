import { fromJS } from 'immutable';

import { getVisualisationsFromDashboard } from './selectors';


describe('redux/modules/dashboard/selectors', () => {
  describe('getVisualisationsFromDashboard', () => {
    it('should select visualisations from dashboard', () => {
      const vizId1 = '000000000000000000000001';
      const vizId2 = '000000000000000000000002';
      const vizId3 = '000000000000000000000003';

      const dashboardId1 = '000000000000000000000101';
      const dashboardId2 = '000000000000000000000102';

      const state = {
        models: fromJS({
          visualisation: {
            [vizId1]: {
              remoteCache: {
                _id: vizId1,
                description: 'visualisation 1',
              },
            },
            [vizId2]: {
              remoteCache: {
                _id: vizId2,
                description: 'visualisation 2',
              },
            },
            [vizId3]: {
              remoteCache: {
                _id: vizId3,
                description: 'visualisation 3',
              },
            },
          },
          dashboard: {
            [dashboardId1]: {
              remoteCache: {
                _id: dashboardId1,
                widgets: [
                  { visualisation: vizId3 },
                  { visualisation: vizId1 },
                ],
                title: 'dashboard 1',
              },
            },
            [dashboardId2]: {
              remoteCache: {
                _id: dashboardId2,
                widgets: [
                  { visualisation: vizId2 },
                ],
                title: 'dashboard 2',
              },
            },
          },
        }),
      };

      const visualisations = getVisualisationsFromDashboard(dashboardId1)(state);
      expect(visualisations.size).toEqual(2);
      expect(visualisations.get(0).get('_id')).toEqual(vizId3);
      expect(visualisations.get(1).get('_id')).toEqual(vizId1);
    });
  });
});
