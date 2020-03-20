import React from 'react';
import { PieChart as Chart, Pie, Tooltip, Cell } from 'recharts';
import { AutoSizer } from 'react-virtualized';
import NoData from 'ui/components/Graphs/NoData';
import getColor from 'ui/utils/colors';
import {
  getResultsData,
  getChartData,
  hasData,
  getLongModel,
} from './Chart';
import { Chart as StyledChart, } from './styled';
import PieTooltip from './PieTooltip';

const cellPadding = 5;

const getInnerRadius = size => i => hole => (
  (size * i) + (cellPadding * i) + hole
);

const getOuterRadius = size => i => hole =>
  (size * (i + 1)) + (cellPadding * i) + hole;

const getPieSize = (cells, maxSize = 375, hole = 0) => {
  const widgetSize = maxSize;
  return ((widgetSize / 2.7) - hole) / cells;
};

const sortData = data =>
  data.sortBy(e => e.get('total'));

const getSortedData = results => labels =>
  sortData(getResultsData(results)(labels));

const renderCell = numberOfEntries => color => (entry, i) => (
  <Cell
    fill={getColor({
      hexColor: color,
      range: numberOfEntries,
      value: i
    })}
    key={`cell-${i}`} />
  );

const renderTooltips = labels => data => count => grouping => (<Tooltip content={<PieTooltip display={getLongModel(data)} labels={labels} count={count} grouping={grouping} />} />);

const renderPie = colors => data => maxSize => isDonut => (label, i, labels) => {
  const holeWidth = 60;
  const hole = isDonut ? holeWidth : 0;

  return (
    <Pie
      key={i}
      data={getChartData(data)}
      nameKey={'_id'}
      dataKey={`Series ${i + 1}`}
      innerRadius={getInnerRadius(getPieSize(labels.size, maxSize, hole))(i)(hole)}
      outerRadius={getOuterRadius(getPieSize(labels.size, maxSize, hole))(i)(hole)}>
      {data.valueSeq().map(renderCell(data.size)(colors.get(i)))}
    </Pie>
  );
};
const renderPies = labels => colors => data => isDonut => maxSize => labels.map(renderPie(colors)(data)(maxSize)(isDonut)).valueSeq();

const renderPieChart = labels => colors => data => count => grouping => isDonut => ({ width, height }) => (
  <Chart width={width} height={height}>
    {renderPies(labels)(colors)(data)(isDonut)(Math.min(width, height))}
    {renderTooltips(labels)(data)(count)(grouping)}
  </Chart>
);

const renderChartResults = labels => results => colors => count => grouping => isDonut =>
  renderPieChart(labels)(colors)(getSortedData(results)(labels))(count)(grouping)(isDonut);

const renderResults = results => labels => colors => count => grouping => isDonut => (
  <StyledChart>
    <div>
      {(colors.size > 1) && colors.map((colour, i) => (
        <div key={i} style={{ fontSize: '0.9em' }}>
          <div
            style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: colour, marginRight: '8px', marginBottom: '2px', verticalAlign: 'middle' }} />
          <span title={labels.get(i) || `Series ${i + 1}`}>{(labels.get(i) && labels.get(i).substr(0, 45)) || `Series ${i + 1}`}</span>
        </div>)
      )}
    </div>
    <div style={{ height: '100%', width: '100%' }}>
      <AutoSizer>{renderChartResults(labels)(results)(colors)(count)(grouping)(isDonut)}</AutoSizer>
    </div>
  </StyledChart>
);

export const PieChartComponent = ({ results, labels, colors, count, grouping, isDonut }) =>
(hasData(results) ? renderResults(results)(labels)(colors)(count)(grouping)(isDonut) : <NoData />);

export default PieChartComponent;
