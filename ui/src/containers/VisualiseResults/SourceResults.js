import React from 'react';
import { compose } from 'recompose';
import { Map, OrderedMap } from 'immutable';
import isString from 'lodash/isString';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import {
  LEADERBOARD,
  XVSY,
  FREQUENCY,
  TEMPLATE_ACTIVITY_OVER_TIME,
  TEMPLATE_MOST_ACTIVE_PEOPLE,
  TEMPLATE_MOST_POPULAR_ACTIVITIES,
  TEMPLATE_MOST_POPULAR_VERBS,
} from 'lib/constants/visualise';
import NoData from 'ui/components/Graphs/NoData';
import { withStatementsVisualisation } from 'ui/utils/hocs';
import { displayVerb, displayActivity } from 'ui/utils/xapi';
import styles from './styles.css';

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

const getGroupAxisLabel = (visualisation) => {
  switch (visualisation.get('type')) {
    // Correlation Chart type
    case XVSY:
      return visualisation.getIn(['axesgroup', 'searchString']) || 'Group';
    // Bar Chart type
    case LEADERBOARD:
    case TEMPLATE_MOST_ACTIVE_PEOPLE:
    case TEMPLATE_MOST_POPULAR_ACTIVITIES:
    case TEMPLATE_MOST_POPULAR_VERBS:
      return visualisation.get('axesyLabel') || visualisation.getIn(['axesgroup', 'searchString']) || 'Y Axis';
    // Line Chart type
    case FREQUENCY:
    case TEMPLATE_ACTIVITY_OVER_TIME:
      return visualisation.get('axesxLabel') || 'yyyy/mm/dd';
    default:
      return visualisation.get('axesxLabel') || visualisation.getIn(['axesgroup', 'searchString']) || 'X Axis';
  }
};

const getValueAxisLabel = (index, visualisation) => {
  switch (visualisation.get('type')) {
    // Correlation Chart type
    case XVSY:
      if (index === 0) {
        return visualisation.get('axesxLabel') || visualisation.getIn(['axesxValue', 'searchString']) || 'X Axis';
      }
      return visualisation.get('axesyLabel') || visualisation.getIn(['axesyValue', 'searchString']) || 'Y Axis';
    // Bar Chart type
    case LEADERBOARD:
    case TEMPLATE_MOST_ACTIVE_PEOPLE:
    case TEMPLATE_MOST_POPULAR_ACTIVITIES:
    case TEMPLATE_MOST_POPULAR_VERBS:
      return visualisation.get('axesxLabel') || visualisation.getIn(['axesvalue', 'searchString']) || 'X Axis';
    default:
      return visualisation.get('axesyLabel') || visualisation.getIn(['axesvalue', 'searchString']) || 'Y Axis';
  }
};

const formatNumber = (selectedAxes) => {
  const count = selectedAxes.get('count');
  if (typeof count !== 'number') {
    return '';
  }
  if (count % 1 !== 0) {
    return count.toFixed(2);
  }
  return count;
};

const SourceResult = ({
  getFormattedResults,
  results,
  labels,
  visualisation,
}) => {
  const formattedResults = getFormattedResults(results);
  const tLabels = labels.map((label, i) => (label === undefined ? `Series ${i + 1}` : label));
  const tableData = generateTableData(formattedResults, tLabels);
  const subColumnsCount = countSubColumns(tLabels, tableData);

  if (!tableData.first()) {
    return <NoData />;
  }

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
            <th>{getGroupAxisLabel(visualisation)}</th>
            {
              tLabels.map(tLabel =>
                [...Array(subColumnsCount).keys()].map(k =>
                  <th key={`${tLabel}-${k}`}>{getValueAxisLabel(k, visualisation)}</th>
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
                    const v = row.getIn(['rowData', tLabel, k], new Map({ count: null }));
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
};

export default compose(
  withStatementsVisualisation,
  withStyles(styles),
)(SourceResult);
