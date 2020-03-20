import React from 'react';
import { Map, OrderedMap } from 'immutable';
import lodash from 'lodash';
import {
  RESPONSE_ROWS_LIMIT,
  LEADERBOARD,
  XVSY,
  FREQUENCY,
  TEMPLATE_ACTIVITY_OVER_TIME,
  TEMPLATE_MOST_ACTIVE_PEOPLE,
  TEMPLATE_MOST_POPULAR_ACTIVITIES,
  TEMPLATE_MOST_POPULAR_VERBS,
  TEMPLATE_STREAM_INTERACTIONS_VS_ENGAGEMENT,
  TEMPLATE_LEARNING_EXPERIENCE_TYPE
} from 'lib/constants/visualise';
import NoData from 'ui/components/Graphs/NoData';
import ScrollableTable from 'ui/components/ScrollableTable';
import { withStatementsVisualisation } from 'ui/utils/hocs';
import { displayVerb, displayActivity } from 'ui/utils/xapi';

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
  if (lodash.isString(key)) return key;

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
    case TEMPLATE_STREAM_INTERACTIONS_VS_ENGAGEMENT:
      return visualisation.getIn(['axesgroup', 'searchString']) || 'Group';
    // Bar Chart type
    case LEADERBOARD:
    case TEMPLATE_MOST_ACTIVE_PEOPLE:
    case TEMPLATE_MOST_POPULAR_ACTIVITIES:
    case TEMPLATE_MOST_POPULAR_VERBS:
    case TEMPLATE_LEARNING_EXPERIENCE_TYPE:
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
    case TEMPLATE_STREAM_INTERACTIONS_VS_ENGAGEMENT:
      if (index === 0) {
        return visualisation.get('axesxLabel') || visualisation.getIn(['axesxValue', 'searchString']) || 'X Axis';
      }
      return visualisation.get('axesyLabel') || visualisation.getIn(['axesyValue', 'searchString']) || 'Y Axis';
    // Bar Chart type
    case LEADERBOARD:
    case TEMPLATE_MOST_ACTIVE_PEOPLE:
    case TEMPLATE_MOST_POPULAR_ACTIVITIES:
    case TEMPLATE_MOST_POPULAR_VERBS:
    case TEMPLATE_LEARNING_EXPERIENCE_TYPE:
      return visualisation.get('axesxLabel') || visualisation.getIn(['axesxValue', 'searchString']) || 'X Axis';
    default:
      return visualisation.get('axesyLabel') || visualisation.getIn(['axesvalue', 'searchString']) || 'Y Axis';
  }
};

/**
 *
 * @param {any} count
 * @returns {string}
 */
const formatNumber = (count) => {
  if (typeof count !== 'number') {
    return '';
  }
  if (count % 1 !== 0) {
    return count.toFixed(2);
  }
  return count.toString();
};

/**
 * @param {immutable.List<immutable.List<immutable.Map<T, immutable.Map<string, any>>>>} allResults
 * @returns {immutable.List<immutable.List<immutable.Map<T, number|null>>>}
 */
export const calcStats = allResults =>
  allResults.map(seriesResult =>
    seriesResult.map((axisResult) => {
      /**
       * The format of `axisResult`'s values is expected to be
       *
       * immutable.Map({
       *   _id: any,
       *   count: number|null,
       *   model: any,
       * })
       */
      if (axisResult.size === 0) {
        return new Map({
          total: null,
          avg: null,
          min: null,
          max: null,
          rowCount: 0,
        });
      }
      const total = axisResult.reduce((acc, r) => acc + r.get('count', 0), 0);
      return new Map({
        total,
        avg: total / axisResult.size,
        min: axisResult.minBy(r => r.get('count')).get('count', null),
        max: axisResult.maxBy(r => r.get('count')).get('count', null),
        rowCount: axisResult.size,
      });
    })
  );

const keyLabels = [
  { key: 'total', label: 'Total' },
  { key: 'avg', label: 'Average' },
  { key: 'max', label: 'Max' },
  { key: 'min', label: 'Min' },
  { key: 'rowCount', label: 'Row Count' },
];

const renderStatsTableRows = ({
  stats,
  subColumnsCount,
}) => keyLabels.map(({ key, label }) => (
  <tr key={key}>
    <th>{label}</th>
    {
      stats.toArray().map((_, sIndex) =>
        [...Array(subColumnsCount).keys()].map(i =>
          <th key={`${sIndex}-${i}`}>
            {formatNumber(stats.getIn([sIndex, i, key]))}
          </th>
        )
      ).flat()
    }
  </tr>
));

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

  const showStats = visualisation.get('showStats', true);
  const showStatsAtTop = showStats && !visualisation.get('statsAtBottom', true);
  const statsAtBottom = showStats && visualisation.get('statsAtBottom', true);

  const stats = calcStats(formattedResults);

  // If result rows is RESPONSE_ROWS_LIMIT, the result might be limited.
  const mightBeLimited = stats.some(s => s.some(a => a.get('rowCount') === RESPONSE_ROWS_LIMIT));

  return (
    <div style={{ height: '100%' }}>
      <div style={{ height: mightBeLimited ? 'calc(100% - 20px)' : '100%' }}>
        <ScrollableTable>
          <thead>
            {moreThanOneSeries(tableData) && (
              <tr>
                <th />
                {
                  tLabels.toArray().map((tLabel, i) => (
                    <th
                      key={i}
                      colSpan={subColumnsCount}>
                      {tLabel}
                    </th>
                  ))
                }
              </tr>
            )}

            <tr>
              <th>{getGroupAxisLabel(visualisation)}</th>
              {
                tLabels.toArray().map((_, i) =>
                  [...Array(subColumnsCount).keys()].map(j =>
                    <th
                      key={`${i}-${j}`}>
                      {getValueAxisLabel(j, visualisation)}
                    </th>
                  )
                ).flat()
              }
            </tr>

            {showStatsAtTop && (
              renderStatsTableRows({ stats, subColumnsCount })
            )}
          </thead>

          <tbody>
            {tableData.toArray().map((row, key) => (
              <tr key={key}>
                <td title={key}>{formatKeyToFriendlyString(row.get('model', key))}</td>
                {
                  tLabels.toArray().map((tLabel, i) =>
                    [...Array(subColumnsCount).keys()].map((j) => {
                      const v = row.getIn(['rowData', tLabel, j], new Map({ count: null }));
                      return <td key={`${i}-${j}`}>{formatNumber(v.get('count'))}</td>;
                    })
                  ).flat()
                }
              </tr>
            ))}
          </tbody>

          {statsAtBottom && (
            <tfoot>
              {renderStatsTableRows({ stats, subColumnsCount })}
            </tfoot>
          )}
        </ScrollableTable>
      </div>

      {mightBeLimited && (
        <div style={{ marginTop: '8px' }}>
          <span>Totals calculated from the first {RESPONSE_ROWS_LIMIT.toLocaleString('en')} records</span>
        </div>
      )}
    </div>
  );
};

export default withStatementsVisualisation(SourceResult);
