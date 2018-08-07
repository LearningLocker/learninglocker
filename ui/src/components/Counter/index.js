import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { round } from 'lodash';
import { Map } from 'immutable';
import NoData from 'ui/components/Graphs/NoData';
import numeral from 'numeral';
import tooltipFactory from 'react-toolbox/lib/tooltip';
import { Link } from 'react-toolbox/lib/link';
import { getPercentage } from 'ui/utils/defaultTitles';
import styles from './styles.css';

const TooltipLink = tooltipFactory(Link);
const trimNumber = x => numeral(x).format('0.[0]a');
const formatShortNumber = x => trimNumber(round(x, 2));
const formatLongNumber = x => x.toLocaleString();
const formatTooltip = (count, benchmarkResult) => `Current: ${formatLongNumber(count)}   Previous: ${benchmarkResult}`;
const getAxisSize = x => (Map.isMap(x) ? x.size : 0);
const getLargestAxisSize = axes => axes.map(getAxisSize).max();
const getLargestSeriesSize = rs => rs.map(getLargestAxisSize).max();
const getResultCount = rs => rs.getIn([0, 0, null, 'count'], 0);
const getBenchmarkResultCount = rs => rs.getIn([1, 0, null, 'count'], 0);
const hasData = rs => getLargestSeriesSize(rs) > 0;
const makeHumanReadable = previewPeriod => previewPeriod.split('_').map(word => `${word.toLowerCase()} `).join('');
const renderCount = color => count => (benchmarkResult) => {
  return (
    <TooltipLink
      style={{ color}}
      label={formatShortNumber(count)}
      tooltip={formatTooltip(count, benchmarkResult)}
      tooltipPosition="top"
      tooltipDelay={600}
      active />
  );
};
const renderCounter = color => rs => (model) => (maxSize) => {
  const percentage = getPercentage(getResultCount(rs), getBenchmarkResultCount(rs));   
  return (
    <div className={styles.counter} style={{ marginLeft: `${maxSize / 3}px`, fontSize: `${ maxSize / 35}em` }}>
      {renderCount(color)(getResultCount(rs))(getBenchmarkResultCount(rs))}
      {rs.size > 1 && ([<div style={{ fontSize: '0.3em', color: percentage.color, fontWeight: '300' }}>
        {percentage.result}
      </div>,
        <div style={{ fontSize: '0.2em', color: percentage.color, fontWeight: '300' }}>{percentage.result !== 'N/A' && `since ${makeHumanReadable(model.get('previewPeriod', ''))}`}</div>])}
    </div>
  );
};
const renderResults = rs => color => model => maxSize => renderCounter(color)(rs)(model)(maxSize);
const counter = ({ results, color, model, maxSize }) => (hasData(results) ? renderResults(results)(color)(model)(maxSize) : <NoData />);
export default withStyles(styles)(counter);
