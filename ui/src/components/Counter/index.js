import React from 'react';
import { isNumber, round } from 'lodash';
import NoData from 'ui/components/Graphs/NoData';
import numeral from 'numeral';
import styled from 'styled-components';
import tooltipFactory from 'react-toolbox/lib/tooltip';
import { Link } from 'react-toolbox/lib/link';
import { getPercentage } from 'ui/utils/defaultTitles';

const TooltipLink = tooltipFactory(Link);
const trimNumber = val => numeral(val).format('0.[0]a');
const formatShortNumber = (val) => {
  if (isNumber(val)) return trimNumber(round(val, 2));
  return 'N/A';
};
const formatLongNumber = (val) => {
  if (isNumber(val)) return val.toLocaleString();
  return 'N/A';
};

const formatTooltip = (count) => {
  if (isNumber(count)) return `${formatLongNumber(count)}`;
  return 'No data';
};

const formatBenchmarkTooltip = ({ count, benchmarkCount }) => {
  const benchmarkText = isNumber(benchmarkCount) ? benchmarkCount : 'No data';
  return `Current: ${formatTooltip(count)} - Previous: ${benchmarkText}`;
};

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

const ContextLabel = styled.div(() => ({
  'font-size': '20p',
  'margin-bottom': '5px',
  'margin-top': '-10px',
  'white-space': 'nowrap',
  overflow: 'hidden',
  'text-overflow': 'ellipsis'
}));


const renderCount = ({ color, count, tooltip, hasBenchmark, hasContextLabel }) => (
  <TooltipLink
    style={{ color, height: hasBenchmark || hasContextLabel ? null : '100%' }}
    label={formatShortNumber(count)}
    tooltip={tooltip}
    tooltipPosition="top"
    tooltipDelay={600}
    active />
);

const renderСontextLabel = ({ contextLabel, fontSize, color }) => (
  <ContextLabel
    style={{ fontSize, color }}
    key="contextLabel">
    {contextLabel}
  </ContextLabel>
  );

const renderBenchmark = ({ percentage, model }) => {
  if (percentage.result === 'N/A') {
    return percentage.result;
  }

  return (
    <div
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
        src={percentage.icon} />{`${percentage.result} (${makeHumanReadable(model.get('previewPeriod', ''))})`}
    </div>
  );
};

const getCountFontsize = ({ height, width, hasBenchmark, hasContextLabel, maxSize }) => {
  let fontSize = hasBenchmark || hasContextLabel ? `${maxSize / 40}` : `${maxSize / 20}`;
  const tripHeight = hasBenchmark || hasContextLabel ? 550 : 200;
  if (height < tripHeight) {
    if (!hasBenchmark && !hasContextLabel) {
      fontSize = width > 200 ? 4.5 : 3.5;
    }
  } else if (width < 550) {
    fontSize = width / 60;
    console.log(`fontSize: ${fontSize}`);
  }
  if (fontSize > 12) fontSize = 12;
  return `${fontSize}em`;
};

const renderCounter = ({ color, results, model, height, width }) => {
  const maxSize = Math.min(height, width);
  const fontSize = (width < 332) || (maxSize < 245) ? '18px' : '0.25em';
  const hasBenchmark = results.size > 1;
  const hasContextLabel = model.get('contextLabel', '') !== '';
  const benchmarkCount = hasBenchmark ? getBenchmarkResultCount(results) : null;
  const count = getResultCount(results);
  const percentage = getPercentage(count, benchmarkCount);

  const tooltip = hasBenchmark ? formatBenchmarkTooltip({ count, benchmarkCount }) : formatTooltip(count);
  const countFontsize = getCountFontsize({ height, width, hasBenchmark, hasContextLabel, maxSize });
  const renderedCount = renderCount({ color, count, tooltip, hasBenchmark, hasContextLabel });
  const renderedBenchmark = hasBenchmark ? renderBenchmark({ percentage, model }) : null;
  const renderedContextLabel = renderСontextLabel({ contextLabel: model.get('contextLabel', ''), fontSize, color });

  return (
    <div style={{ height: '100%' }}>
      <div
        style={{ width, fontSize: countFontsize, height: '100%', textAlign: 'center' }}>
        { renderedCount }
        { renderedContextLabel }
        <div
          key="benchmark"
          style={{
            fontSize,
            color: percentage.color,
            textAlign: 'center',
            justifyContent: 'center',
            display: 'flex',
            fontWeight: '300',
          }}>{renderedBenchmark}</div>
      </div>
    </div>
  );
};
const counter = ({ results, color, model, height, width }) =>
  (results ? renderCounter({ results, color, model, height, width }) : <NoData />);

export default counter;
