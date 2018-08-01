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
const getAxisSize = x => (Map.isMap(x) ? x.size : 0);
const getLargestAxisSize = axes => axes.map(getAxisSize).max();
const getLargestSeriesSize = rs => rs.map(getLargestAxisSize).max();
const getResultCount = rs => rs.getIn([0, 0, null, 'count'], 0);
const getBenchmarkResultCount = rs => rs.getIn([1, 0, null, 'count'], 0);
const hasData = rs => getLargestSeriesSize(rs) > 0;
const renderCount = color => count => (
  <TooltipLink
    style={{ color }}
    label={formatShortNumber(count)}
    tooltip={formatLongNumber(count)}
    tooltipPosition="top"
    tooltipDelay={600}
    active />
);
const renderCounter = color => (rs) => {
  const percentage = getPercentage(getResultCount(rs), getBenchmarkResultCount(rs));
  return (
    <div className={styles.counter} >
      {renderCount(color)(getResultCount(rs))}
      {rs.size > 1 && (<div style={{ fontSize: '0.4em', color: percentage.color }}>
        {percentage.result}
      </div>)}
    </div>
  );
};
const renderResults = rs => color => renderCounter(color)(rs);

const counter = ({ results, color }) => (hasData(results) ? renderResults(results)(color) : <NoData />);


export default withStyles(styles)(counter);
