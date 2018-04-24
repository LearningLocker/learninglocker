// @ts-check
import React from 'react';
import { round } from 'lodash';
import numeral from 'numeral';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
// @ts-ignore
import styles from './utils/styles.css';

/**
 * @typedef {Object} ValueConfig
 * @property {string} key
 * @property {string} operator
 * @property {string} colour
 * @typedef {Object} Model
 * @property {ValueConfig} value
 * @typedef {Object} GroupResult
 * @property {null} _id
 * @property {number} count
 */

const render = withStyles(styles)(
  /**  @param {{ model: Model, seriesResults: GroupResult[][] }} props */
  (props) => {
    const { model, seriesResults } = props;
    const count = seriesResults[0][0].count;
    const color = model.value.colour;

    return (
      <div className={styles.counter} title={count.toLocaleString()} styles={{ color }} >
        {numeral(round(count, 2)).format('0.[0]a')}
      </div>
    );
  }
);

export default render;
