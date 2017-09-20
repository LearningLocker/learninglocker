import { fromJS, Set } from 'immutable';
import {
  getLabel,
  getChartData
} from './Chart.js';

test('getLabel should return number', () => {
  global.navigator = {
    languages: ['en-GB']
  };

  const mockEntryId = fromJS([1]);

  const label = getLabel(mockEntryId);

  expect(label.toJS()).toEqual([1]);
});

test('getLabel should return en-GB name', () => {
  global.navigator = {
    languages: ['en-GB']
  };

  const mockEntryId = fromJS([{
    definition: {
      name: {
        'fr-FR': 'French',
        'en-GB': 'English'
      }
    }
  }]);

  const label = getLabel(mockEntryId);

  expect(label.toJS()).toEqual(['English']);
});

test('getLabel should return first in en-GB not present', () => {
  global.navigator = {
    languages: ['en-GB']
  };

  const mockEntryId = fromJS([{
    definition: {
      name: {
        'fr-FR': 'French',
        'rs-RS': 'Russian'
      }
    }
  }]);

  const label = getLabel(mockEntryId);

  expect(label.toJS()).toEqual(['French']);
});

test('getChartData should filter item', () => {
  const data = fromJS({
    item1: {
      s1: 6,
      s2: 7
    }
  });
  const hiddenSeries = new Set(['s2']);

  const result = getChartData(data, hiddenSeries);
  console.log('result', result);
  expect(result[0].s2).toEqual(undefined);
  expect(result[0].s1).toEqual(6);
});
