// @ts-check
import React from 'react';
import { Bar } from 'recharts';
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
      <Bar key={index} dataKey={seriesDataKey} fill={colour} name={label} stackId={stackId} />
    );
  });
};

export default renderBars;
