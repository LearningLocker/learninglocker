// @ts-check
import React from 'react';
import { Line } from 'recharts';
import getSeriesDataKey from './getSeriesDataKey';

/**
 * @typedef {Object} Series
 * @property {string} label
 * @property {string} colour
 * @typedef {Object} Config
 * @property {boolean} stacked
 * @property {Series[]} series
 */

/**
 * @param {{ config: Config }} props
 */
const renderBars = (props) => {
  const { config } = props;
  return config.series.map((series, index) => {
    const { label, colour } = series;
    const seriesDataKey = getSeriesDataKey(index);
    const stackId = config.stacked === true ? 1 : index;
    return (
      <Line key={index} dataKey={seriesDataKey} stroke={colour} name={label} type="monotone" dot={false} />
    );
  });
};

export default renderBars;
