import React from 'react';
import { compose, withProps } from 'recompose';
import NoData from 'ui/components/Graphs/NoData';
import { Map, OrderedMap } from 'immutable';
import isString from 'lodash/isString';
import { withStatementsVisualisation } from 'ui/utils/hocs';
import { getAxesString } from 'ui/utils/defaultTitles';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import styles from './styles.css';
import { displayVerb, displayActivity } from '../../utils/xapi';

const getAxes = (index, axes) => {
  switch (index) {
    case 0: return axes.get('xLabel') !== '' ? axes.get('xLabel') : axes.getIn(['xValue', 'searchString'], 'X-Axis');
    case 1: return axes.get('yLabel') !== '' ? axes.get('yLabel') : axes.getIn(['yValue', 'searchString'], 'Y-Axis');
    default: return axes.get('xLabel', 'X-Axes');
  }
};

const moreThanOneSeries = tData => tData.first() !== undefined && tData.first().size > 1;

export const generateTableData = (results, labels, axes, type) => {
  const seriesList = labels.zip(results);
  const seriesList2 = seriesList.map(([key, item], i) => {
    if (key === undefined) {
      return [`Series ${i+1}`, item];
    }
    return [key, item];
  });

  const seriesMap = new OrderedMap(seriesList2);

  const result = seriesMap.reduce((reduction, series, seriesKey) =>

    series.reduce((axesReduction, axes2, axesKey) => axes2.reduce((seriesReduction, item) => seriesReduction.setIn(
          [item.get('model'), seriesKey, getAxes(axesKey, axes, type)],
          item
        ), axesReduction), reduction)
  , new OrderedMap());
  return result;
};

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

const createSelectIfXVSY = (index, visualisation, type, title, axis) => {
  if (!(type === 'XVSY')) {
    return getAxisLabel(axis, visualisation, type, title);
  }
  if (title.length) {
    return title;
  }
  if (index !== 0) {
    return visualisation.getIn(['axesxValue', 'searchString'], 'No value');
  }
  return visualisation.getIn(['axesyValue', 'searchString'], 'No value');
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
  axes,
  model,
  visualisation
}) => {
  const formattedResults = getFormattedResults(results);
  const tableData = generateTableData(formattedResults, labels, axes, visualisation.get('type'));
  if (tableData.first()) {
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
              <th>{getAxisLabel('x', visualisation, model.get('type'))}</th>
              {tableData.first().map((series) => {
                  const out = series.mapEntries((title, index) =>
                    [index, (
                      <th>{createSelectIfXVSY(index, visualisation, model.get('type'), title[0], 'y')}</th>
                    )]
                  );
                  return out;
                })
              }
            </tr>
            {tableData.map((item, key) => (
              <tr>
                <td>{formatKeyToFriendlyString(key)}</td>
                {item.map(series =>
                  series.map(axes2 => (<td>{formatNumber(axes2)}</td>)
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return (<NoData />);
});
