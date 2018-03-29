// @ts-check
import React from 'react';
import { Line } from 'recharts';
import getSeriesDataKey from './getSeriesDataKey';

/**
 * @typedef {Object} Series
 * @property {string} label
 * @property {string} colour
 * @typedef {Object} Model
 * @property {boolean} stacked
 * @property {Series[]} series
 */

/**
 * @param {{ model: Model }} props
 */
const renderBars = (props) => {
  const { model } = props;
  return model.series.map((series, index) => {
    const { label, colour } = series;
    const seriesDataKey = getSeriesDataKey(index);
    const stackId = model.stacked === true ? 1 : index;
    return (
      <Line key={index} dataKey={seriesDataKey} stroke={colour} name={label} type="monotone" dot={false} />
    );
  });
};

export default renderBars;
