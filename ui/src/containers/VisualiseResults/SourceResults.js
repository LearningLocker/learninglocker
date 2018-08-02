import React from 'react';
import { compose } from 'recompose';
import { Map, OrderedMap } from 'immutable';
import isString from 'lodash/isString';
import { withStatementsVisualisation } from 'ui/utils/hocs';
import { getLegend } from 'ui/utils/defaultTitles';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import styles from './styles.css';
import { displayVerb, displayActivity } from '../../utils/xapi';

const getAxes = (index, axes) => {
  switch (index) {
    case 0:
      return axes.get('xLabel', 'X-Axes');
    case 1:
      return axes.get('yLabel', 'Y-Axes');
    default:
      return axes.get('xLabel', 'X-Axes');
  }
};

const moreThanOneSeries = tData => tData.first().size > 1;

export const generateTableData = (results, labels, axes) => {
  const seriesList = labels.zip(results);
  const seriesList2 = seriesList.map(([key, item], i) => {
    if (key === undefined) {
      return [`Series ${i}`, item];
    }
    return [key, item];
  });

  const seriesMap = new OrderedMap(seriesList2);

  const result = seriesMap.reduce((reduction, series, seriesKey) =>

    series.reduce((axesReduction, axes2, axesKey) =>

      axes2.reduce((seriesReduction, item) => seriesReduction.setIn(
          [item.get('model'), seriesKey, getAxes(axesKey, axes)],
          item
        ), axesReduction)
    , reduction)
  , new OrderedMap());

  return result;
};

const formatKeyToFriendlyString = (key) => {
  // return directly if just a string
  if (isString(key)) return key;

  if (Map.isMap(key)) {
    if (key.get('objectType')) {
      // call xapi activity helper
      return displayActivity(key);
    }
    if (key.get('display')) {
      // call xapi verb helper
      return displayVerb(key);
    }

    if (key.has('id')) {
      // if it has an id, lets just throw that back
      return key.get('id');
    }

    return JSON.stringify(key.toJS(), null, 2);
  }

  return JSON.stringify(key, null, 2);
};

const getAxisLabel = (axis, visualisation, type, axesKey) => {
  if (!type === 'XVSY') {
    return getLegend(axis, visualisation);
  }
  return getLegend(axis, visualisation, 'XVSY', axesKey);
};
export default compose(
  withStatementsVisualisation,
  withStyles(styles)
)(({
  getFormattedResults,
  results,
  labels,
  axes,
  model,
  visualisation
}) => {
  const formattedResults = getFormattedResults(results);
  const tableData = generateTableData(formattedResults, labels, axes);
  return (
    <div className={styles.sourceResultsContainer}>
      <table className="table table-bordered table-striped">
        <tbody>
          {moreThanOneSeries(tableData) && <tr>
            <th />
            {tableData.first().map((item, key) => (
              <th colSpan={item.size}>{key}</th>
            ))}
          </tr>}
          <tr>
            <th>{getAxisLabel('y', visualisation, model.get('type'))}</th>
            {
              tableData.first().map(series => (
                series.map((axes2, axesKey) => (
                  <th>{getAxisLabel('x', visualisation, model.get('type'), axesKey)}</th>
                ))
              ))
            }
          </tr>
          {tableData.map((item, key) => (
            <tr>
              <td>{formatKeyToFriendlyString(key)}</td>
              {item.map(series =>
                series.map(axes2 => (<td>{axes2.get('count')}</td>)
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});
