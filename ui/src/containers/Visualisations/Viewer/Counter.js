// @ts-check
import React from 'react';
import { round, get } from 'lodash';
import numeral from 'numeral';
import { compose } from 'recompose';
// @ts-ignore
import { withStatementsVisualisation } from 'ui/utils/hocs';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
// @ts-ignore
import styles from './utils/styles.css';
import migrateCounterModel from '../utils/migrateCounterModel';

/**
 * @typedef {Object} ValueConfig
 * @property {string} key
 * @property {string} operator
 * @property {string} colour
 * @typedef {Object} Config
 * @property {ValueConfig} value
 * @typedef {Object} Model
 * @property {Config} config
 * @typedef {Object} GroupResult
 * @property {null} _id
 * @property {number} count
 */

export default compose(
  withStyles(styles),
  withStatementsVisualisation,
)(
  /**  @param {{ model: Model, results: GroupResult[][] }} props */
  (props) => {
    const { model, results } = props;
    const newModel = migrateCounterModel(model);
    const config = newModel.config;
    const count = get(results, [0, 0, 'count'], 0);
    const color = config.value.colour;

    return (
      <div className={styles.counter} title={count.toLocaleString()} style={{ color }} >
        {numeral(round(count, 2)).format('0.[0]a')}
      </div>
    );
  }
);
