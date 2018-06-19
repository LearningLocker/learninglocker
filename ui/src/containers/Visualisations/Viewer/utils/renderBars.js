// @ts-check
import React from 'react';
import { Bar } from 'recharts';
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
      <Bar key={index} dataKey={seriesDataKey} fill={colour} name={label} stackId={stackId} />
    );
  });
};

export default renderBars;
