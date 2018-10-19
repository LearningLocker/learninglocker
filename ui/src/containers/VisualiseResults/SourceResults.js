import React from 'react';
import { compose } from 'recompose';
import NoData from 'ui/components/Graphs/NoData';
import { Map, OrderedMap, fromJS } from 'immutable';
import isString from 'lodash/isString';
import { withStatementsVisualisation } from 'ui/utils/hocs';
import { getAxesString } from 'ui/utils/defaultTitles';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import styles from './styles.css';
import { displayVerb, displayActivity } from '../../utils/xapi';

const moreThanOneSeries = tData => tData.first() !== undefined && tData.first().size > 1;

export const generateTableData = (results, labels) => {
  const seriesList = labels.zip(results);
  const seriesList2 = seriesList.map(([key, item], i) => {
    if (key === undefined) {
      return [`Series ${i + 1}`, item];
    }
    return [key, item];
  });
  const setIdInSeries = (out, largestSeries) => {
    const currentKeys = out.first().keySeq().toArray();
    const missingKeys = largestSeries.keys.filter(key => !currentKeys.includes(key));
    const objectToMerge = {};
    missingKeys.forEach((key) => {
      objectToMerge[key] = {
        _id: key,
        count: 0,
        model: 'Empty'
      };
    });
    return out.first().mergeDeep(fromJS(objectToMerge));
  };

  const seriesMap = new OrderedMap(seriesList2);
  const largestSeries = seriesMap.reduce((history, current) => {
    return {
      size: Math.max(current.first().size, history.size),
      keys: (() => {
        if (current.first().size > history.size){
          return current.first().keySeq().toArray();
        }
        return history.keys;
      })()
    };
  }, { size: 0, series: 0 });

  const result = seriesMap.reduce((reduction, series, seriesKey) => {
    console.log('series', series)
    if (series.size < largestSeries.size) {
      series = setIdInSeries(series, largestSeries);
    }
    console.log('fixed series ', series)
    const out = series.reduce(
      (axesReduction, axes2, axesKey) => axes2.reduce(
        (seriesReduction, item) => {
          console.log('item!', item)
          const dataKeyName = [item.get('_id') || item, 'rowData', seriesKey, axesKey];
          const modelKeyName = [item.get('_id'), 'model'];
          return seriesReduction
            .setIn(dataKeyName, item)
            .setIn(modelKeyName, item.get('model'));
        },
      axesReduction),
    reduction)
    return out;
  }
  , new OrderedMap());
  console.log('result size', result.size)
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
  const tableData = generateTableData(formattedResults, labels);
  if (tableData.first()) {
    return (
      <div className={styles.sourceResultsContainer}>
        <table className="table table-bordered table-striped">
          <tbody>
            {moreThanOneSeries(tableData) && <tr>
              <th />
              {tableData.first().get('rowData', new Map()).map((item, key) => (
                <th key={key} colSpan={item.size}>{key}</th>
              )).valueSeq()}
            </tr>}
            <tr>
              <th>{getAxisLabel('x', visualisation, model.get('type'))}</th>
              {tableData.first().get('rowData', new Map()).map((series, key) => {
                const out = series.mapEntries(
                  ([title], index) =>
                    [
                      index,
                      (<th key={`${key}-${index}`}>{createSelectIfXVSY(index, visualisation, model.get('type'), 'y')}</th>)
                    ]
                  );
                return out.valueSeq();
              }).valueSeq()
              }
            </tr>
            {tableData.map((row, key) => (
              <tr key={key}>
                <td title={key}>{formatKeyToFriendlyString(row.get('model', key))}</td>
                {row.get('rowData', new Map()).map(series =>
                  series.map(axes2 => (
                    <td>{formatNumber(axes2)}</td>)
                  ).valueSeq()
                ).valueSeq()}
              </tr>
            )).valueSeq()}
          </tbody>
        </table>
      </div>
    );
  }
  return (<NoData />);
});