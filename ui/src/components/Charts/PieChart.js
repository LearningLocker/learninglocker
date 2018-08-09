import React from 'react';
import { PieChart as Chart, Pie, Tooltip, Cell } from 'recharts';
import { AutoSizer } from 'react-virtualized';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import NoData from 'ui/components/Graphs/NoData';
import getColor from 'ui/utils/colors';
import {
  getResultsData,
  getChartData,
  hasData,
  getLongModel,
} from './Chart';
import PieTooltip from './PieTooltip';
import styles from './styles.css';


const cellPadding = 5;

const getInnerRadius = size => i =>
  (size * i) + (cellPadding * i);

const getOuterRadius = size => i =>
  (size * (i + 1)) + (cellPadding * i);

const getPieSize = (cells, maxSize = 375) => {
  const widgetSize = maxSize;
  return (widgetSize / 2.5) / cells;
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


const renderPie = colors => data => maxSize => (label, i, labels) => (
  <Pie
    key={i}
    data={getChartData(data)}
    nameKey={'_id'}
    dataKey={`s${i}`}
    innerRadius={getInnerRadius(getPieSize(labels.size, maxSize))(i)}
    outerRadius={getOuterRadius(getPieSize(labels.size, maxSize))(i)}>
    {data.valueSeq().map(renderCell(data.size)(colors.get(i)))}
  </Pie>
  );
const renderPies = labels => colors => data => maxSize =>
  labels.map(renderPie(colors)(data)(maxSize)).valueSeq();

const renderPieChart = labels => colors => data => count => grouping => ({ width, height }) => (
  <Chart width={width} height={height}>
    {renderPies(labels)(colors)(data)(Math.min(width, height))}
    {renderTooltips(labels)(data)(count)(grouping)}
  </Chart>
);

const renderChart = chart => (
  <div className={styles.chart}>
    <AutoSizer>{chart}</AutoSizer>
  </div>
);

const renderChartResults = labels => results => colors => count => grouping =>
  renderPieChart(labels)(colors)(getSortedData(results)(labels))(count)(grouping);

const renderResults = results => labels => colors => count => grouping => renderChart(renderChartResults(labels)(results)(colors)(count)(grouping));

export const PieChartComponent = ({ results, labels, colors, count, grouping }) =>
(hasData(results) ? renderResults(results)(labels)(colors)(count)(grouping) : <NoData />);

export default withStyles(styles)(
  PieChartComponent
);
