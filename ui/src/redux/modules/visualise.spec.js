import { fromJS } from 'immutable';
import { visualisationPiplelinesSelector } from './visualise';

test('visualisationPiplelinesSelector should unflattern axis', () => {
  const mockVisualisation = fromJS({
    axesxValue: 6245
  });
  const mockState = { models:
    fromJS({
      visualisation: {
        56: {
          remoteCache: mockVisualisation
        }
      }
    })
  };

  const mockCb = jest.fn().mockReturnValue(3624);

  const result = visualisationPiplelinesSelector('56', mockCb)(mockState);

  expect(mockCb.mock.calls[0][1].get('xValue')).toEqual(6245);
  expect(result).toEqual(3624);
  expect(mockCb.mock.calls.length).toEqual(1);
});
