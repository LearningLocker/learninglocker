import React from 'react';
import { compose } from 'recompose';
import NoData from 'ui/components/Graphs/NoData';
import { Map, OrderedMap } from 'immutable';
import isString from 'lodash/isString';
import { withStatementsVisualisation } from 'ui/utils/hocs';
import { getAxesString } from 'ui/utils/defaultTitles';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import styles from './styles.css';
import { displayVerb, displayActivity } from '../../utils/xapi';

const moreThanOneSeries = tData => tData.first() !== undefined && tData.first().size > 1;

export const generateTableData = (results, labels) => {
  const seriesList = labels.zip(results);
  const seriesMap = new OrderedMap(seriesList);
  const result = seriesMap.reduce((reduction, series, seriesKey) =>
    series.reduce(
      (axesReduction, axes2, axesKey) => axes2.reduce(
        (seriesReduction, item) => {
          const dataKeyName = [item.get('_id'), 'rowData', seriesKey, axesKey];
          const modelKeyName = [item.get('_id'), 'model'];
          return seriesReduction
            .setIn(dataKeyName, item)
            .setIn(modelKeyName, item.get('model'));
        },
      axesReduction),
    reduction)
  , new OrderedMap());
  return result;
};

/**
 * Count sub columns
 *
 * @param {List} labels - List of string. Don't include undefined
 * @param {OrderedMap} tableData
 * @returns {Number} the number of sub columns.
 */
const countSubColumns = (labels, tableData) =>
  labels.reduce(
    (acc1, label) =>
      tableData.reduce(
        (acc2, row) =>
          Math.max(acc2, row.getIn(['rowData', label], new Map()).size),
        acc1
      ),
    1
  );

const formatKeyToFriendlyString = (key) => {
  if (isString(key)) return key;

  if (Map.isMap(key)) {
    if (key.get('objectType')) {
      return displayActivity(key);
    }
    if (key.get('display')) {
      return displayVerb(key);
    }
    if (key.has('id')) {
      return key.get('id');
    }

    return JSON.stringify(key.toJS(), null, 2);
  }

  return JSON.stringify(key, null, 2);
};

const getAxisLabel = (axis, visualisation, type) => {
  if (type !== 'XVSY') {
    return getAxesString(axis, visualisation, type, false);
  }
  return visualisation.getIn(['axesgroup', 'searchString'], 'No value');
};

const createSelectIfXVSY = (index, visualisation, type, axis) => {
  if (type !== 'XVSY') {
    return getAxisLabel(axis, visualisation, type);
  }
  if (index === 0) {
    return visualisation.get('axesxLabel', visualisation.getIn(['axesxValue', 'searchString'], 'No value'));
  }
  return visualisation.get('axesyLabel', visualisation.getIn(['axesyValue', 'searchString'], 'No value'));
};

const formatNumber = (selectedAxes) => {
  if (selectedAxes.get('count') % 1 !== 0) {
    return selectedAxes.get('count').toFixed(2);
  }
  return selectedAxes.get('count');
};

export default compose(
  withStatementsVisualisation,
  withStyles(styles),
)(({
  getFormattedResults,
  results,
  labels,
  model,
  visualisation
}) => {
  const formattedResults = getFormattedResults(results);
  const tLabels = labels.map((label, i) => (label === undefined ? `Series ${i + 1}` : label));
  const tableData = generateTableData(formattedResults, tLabels);
  const subColumnsCount = countSubColumns(tLabels, tableData);

  if (tableData.first()) {
    return (
      <div className={styles.sourceResultsContainer}>
        <table className="table table-bordered table-striped">
          <tbody>
            {moreThanOneSeries(tableData) && <tr>
              <th />
              {
                tLabels.map(tLabel => (
                  <th key={tLabel} colSpan={subColumnsCount}>{tLabel}</th>
                )).valueSeq()
              }
            </tr>}

            <tr>
              <th>{getAxisLabel('x', visualisation, model.get('type'))}</th>
              {
                tLabels.map(tLabel =>
                  [...Array(subColumnsCount).keys()].map(k =>
                    <th key={`${tLabel}-${k}`}>{createSelectIfXVSY(k, visualisation, model.get('type'), 'y')}</th>
                  )
                ).valueSeq()
              }
            </tr>

            {tableData.map((row, key) => (
              <tr key={key}>
                <td title={key}>{formatKeyToFriendlyString(row.get('model', key))}</td>
                {
                  tLabels.map(tLabel =>
                    [...Array(subColumnsCount).keys()].map((k) => {
                      const v = row.getIn(['rowData', tLabel, k], 0);
                      return <td key={`${tLabel}-${k}`}>{formatNumber(v)}</td>;
                    })
                  ).valueSeq()
                }
              </tr>
            )).valueSeq()}
          </tbody>
        </table>
      </div>
    );
  }
  return (<NoData />);
});
