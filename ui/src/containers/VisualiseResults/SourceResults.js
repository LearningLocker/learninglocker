import React from 'react';
import { compose } from 'recompose';
import NoData from 'ui/components/Graphs/NoData';
import { Map, OrderedMap, toJS } from 'immutable';
import isString from 'lodash/isString';
import { withStatementsVisualisation } from 'ui/utils/hocs';
import { getAxesString } from 'ui/utils/defaultTitles';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import styles from './styles.css';
import { isUndefined } from 'lodash';
import { displayVerb, displayActivity } from '../../utils/xapi';

const moreThanOneSeries = tData => tData.first() !== undefined && tData.first().size > 1;

export const generateTableData = (results, labels) => {
  const seriesList = labels.zip(results);
  console.log('sl',seriesList)
  const seriesList2 = seriesList.map(([key, item], i) => {
    console.log('yo',[key, item])
    if (key === undefined) {
      return [`Series ${i + 1}`, item];
    }
    return [key, item];
  });

  const seriesMap = new OrderedMap(seriesList2);
  const sizeCount = seriesMap.reduce((history, current) => {
    console.log('hist,curr', history, current, current.first())
    return Math.max(current.first().size, history)
  }, 0)
  console.log('seriesMap', seriesMap)
  const result = seriesMap.reduce((reduction, series, seriesKey) => {
    console.log('seriessss', series, series.size)
    return series.reduce((axesReduction, axes2, axesKey) => {
     
      console.log('axes2',axes2, seriesMap)
      const out = axes2.reduce((seriesReduction, item) => {
        const dataKeyName = [item.get('_id'), 'rowData', seriesKey, axesKey];
        const modelKeyName = [item.get('_id'), 'model'];
        console.log('seriesr', seriesReduction);
        return seriesReduction
          .setIn(dataKeyName, item)
          .setIn(modelKeyName, item.get('model'));
      }, axesReduction)
      console.log('size', out.length, out.size)
      console.log('sizeCount', sizeCount)
  
      return out
    },
    reduction)
  }
  , new OrderedMap());
  console.log('result', result)
  const mindFuck = result.forEach((item,index) => {
    console.log(item.get('rowData'))
    labels.forEach((label,iterator) => {
      console.log('it row',item.get('rowData')[iterator])
      if (isUndefined(item.get('rowData')[iterator])){
        console.log('got an undefined at ', iterator)
        item.setIn('rowData', `Series ${iterator}`, 'Empty')
      }
    })

  })
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
