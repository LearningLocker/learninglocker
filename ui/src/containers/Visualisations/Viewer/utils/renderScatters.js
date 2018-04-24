// @ts-check
import React from 'react';
import { Scatter } from 'recharts';
import { values } from 'lodash';
import getSeriesDataKey from './getSeriesDataKey';

/**
 * @typedef {Object} GroupedSeriesResult
 * @property {string} groupId
 * @property {string} name
 * @property {number} firstCount
 * @property {number} secondCount
 * @typedef {Object} Series
 * @property {string} label
 * @property {string} colour
 * @typedef {Object} Model
 * @property {Series[]} series
 */

/**
 * @param {{ model: Model, groupedSeriesResults: {[groupId: string]: GroupedSeriesResult}[] }} props
 */
const renderScatters = (props) => {
  const { model, groupedSeriesResults } = props;
  return model.series.map((series, seriesIndex) => {
    const { label, colour } = series;
    return (
      <Scatter
        name={label}
        data={values(groupedSeriesResults[seriesIndex])}
        fill={colour} />
    );
  });
};

export default renderScatters;
