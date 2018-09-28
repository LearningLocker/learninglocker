import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { round } from 'lodash';
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
const getResultCount = rs => rs.getIn([0, 0, null, 'count'], 0);
const getBenchmarkResultCount = rs => rs.getIn([1, 0, null, 'count'], 0);
const makeHumanReadable = (previewPeriod) => {
  if (previewPeriod !== 'Today') {
    return previewPeriod.split('LAST_')[1].replace('_', ' ').toLowerCase();
  }
  return previewPeriod;
};
const resultsIconStyles = {
  height: '40px',
  width: '40px',
};
const renderCount = color => count => benchmarkResult => (
  <TooltipLink
    style={{ color }}
    label={formatShortNumber(count)}
    tooltip={formatTooltip(count, benchmarkResult)}
    tooltipPosition="top"
    tooltipDelay={600}
    active />
  );
const renderBenchmark = (percentage, rs, model) => {
  if (percentage.result === 'N/A') {
    return percentage.result;
  }

  return (<div
    style={{
      backgroundColor: '#F4F4F4',
      borderRadius: '40px',
      width: 'fit-content',
      padding: '1.3% 7% 0.8% 3%',
      color: '#595959',
    }}>
    <img
      className="counterResIcon"
      role="presentation"
      style={{ marginBottom: percentage.marginBottom, ...resultsIconStyles }}
      src={percentage.icon} />{`${percentage.result} (${makeHumanReadable(model.get('previewPeriod', ''))})`}</div>);
};

const renderCounter = color => rs => model => (maxSize, width) => {
  const fontSize = (width < 332) || (maxSize < 245) ? '13px' : '0.2em';
  const percentage = getPercentage(getResultCount(rs), getBenchmarkResultCount(rs));
  return (
    <div className="outerCounter" >
      <div style={{ textAlign: 'center', width: `${width}px`, marginLeft: `${width / 5}px!important`, fontSize: `${maxSize / 40}em` }}>
        {renderCount(color)(getResultCount(rs))(getBenchmarkResultCount(rs))}
        {rs.size > 1 &&
          <div key={'count-1'} style={{ textAlign: 'center', justifyContent: 'center', display: 'flex', fontSize, color: percentage.color, fontWeight: '300' }}>
            {renderBenchmark(percentage, rs, model, width)}
          </div>
        }
      </div>
    </div>
  );
};
const renderResults = rs => color => model => (maxSize, width) => renderCounter(color)(rs)(model)(maxSize, width);
const counter = ({ results, color, model, maxSize, width }) => (results ? renderResults(results)(color)(model)(maxSize, width) : <NoData />);
export default withStyles(styles)(counter);