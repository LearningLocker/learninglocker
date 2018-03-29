// @ts-check
import React from 'react';
// @ts-ignore
import { withStatementsVisualisation } from 'ui/utils/hocs';
import Viewer from './ValuesTable';

const dummyModel = {
  stacked: false,
  series: [{
    label: 'Series 1',
    colour: 'blue',
  }, {
    label: 'Series 2',
    colour: 'red',
  }],
  group: {
    label: 'Group Label',
  },
  value: {
    label: 'Value Label',
  },
};
const dummyResults = [
  [{ "_id": "2017-10-23", "count": 350, "model": "2017-10-23" }, { "_id": "2017-10-24", "count": 312, "model": "2017-10-24" }, { "_id": "2017-10-20", "count": 290, "model": "2017-10-20" }, { "_id": "2017-10-25", "count": 92, "model": "2017-10-25" }, { "_id": "2017-10-18", "count": 66, "model": "2017-10-18" }, { "_id": "2017-10-17", "count": 22, "model": "2017-10-17" }, { "_id": "2017-11-06", "count": 20, "model": "2017-11-06" }],
  [{ "_id": "2017-11-10", "count": 336, "model": "2017-11-10" }, { "_id": "2017-10-25", "count": 109, "model": "2017-10-25" }, { "_id": "2017-11-08", "count": 84, "model": "2017-11-08" }, { "_id": "2017-11-13", "count": 78, "model": "2017-11-13" }, { "_id": "2017-11-14", "count": 40, "model": "2017-11-14" }, { "_id": "2017-11-07", "count": 24, "model": "2017-11-07" }]
];

export default withStatementsVisualisation(({ results }) => {
  const seriesResults = results.toJS();
  return (
    <Viewer model={dummyModel} seriesResults={dummyResults} />
  );
});
