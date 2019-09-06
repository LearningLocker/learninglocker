import { fromJS } from 'immutable';
import { visualisationPipelinesSelector } from './visualise';

test('visualisationPipelinesSelector should unflatten axis', () => {
  const mockVisualisation = fromJS({
    axesxValue: 6245
  });
  const mockState = {
    models: fromJS({
      visualisation: {
        56: {
          remoteCache: mockVisualisation
        }
      }
    }),
    auth: fromJS({
      activeTokenType: 'dashboard',
      activeTokenId: '111111111111111111111111',
      tokens: {
        dashboard: {
          '111111111111111111111111': {
            organisation: '222222222222222222222222'
          },
        },
      },
    }),
  };

  const mockCb = jest.fn().mockReturnValue(3624);

  const result = visualisationPipelinesSelector('56', mockCb)(mockState);

  expect(mockCb.mock.calls[0][1].get('xValue')).toEqual(6245);
  expect(result).toEqual(3624);
  expect(mockCb.mock.calls.length).toEqual(1);
});
