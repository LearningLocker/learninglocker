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

const getPieSize = cells =>
  175 / cells;

const sortData = data =>
  data.sortBy(e => e.get('total'));

const getSortedData = results => labels =>
  sortData(getResultsData(results)(labels));

const renderCell = numberOfEntries => color => (entry, i) => (
  <Cell
    fill={getColor({
      hexColor: color,
      range: numberOfEntries,
      value: i,
    })}
    key={`cell-${i}`} />
);

const renderTooltips = labels => data =>
  (<Tooltip content={<PieTooltip display={getLongModel(data)} labels={labels} />} />);

const renderPie = colors => data => (label, i, labels) =>
  (
    <Pie
      key={i}
      data={getChartData(data)}
      nameKey={'_id'}
      valueKey={`s${i}`}
      innerRadius={getInnerRadius(getPieSize(labels.size))(i)}
      outerRadius={getOuterRadius(getPieSize(labels.size))(i)}>
      {data.valueSeq().map(renderCell(data.size)(colors.get(i)))}
    </Pie>
  );

const renderPies = labels => colors => data =>
  labels.map(renderPie(colors)(data)).valueSeq();

const renderPieChart = labels => colors => data => ({ width, height }) => (
  <Chart width={width} height={height}>
    {renderPies(labels)(colors)(data)}
    {renderTooltips(labels)(data)}
  </Chart>
);

const renderChart = chart => (
  <div className={styles.chart}>
    <AutoSizer>{chart}</AutoSizer>
  </div>
);

const renderChartResults = labels => results => colors =>
  renderPieChart(labels)(colors)(getSortedData(results)(labels));

const renderResults = results => labels => colors =>
  renderChart(renderChartResults(labels)(results)(colors));

export default withStyles(styles)(({ results, labels, colors }) =>
  (hasData(results) ? renderResults(results)(labels)(colors) : <NoData />)
);
