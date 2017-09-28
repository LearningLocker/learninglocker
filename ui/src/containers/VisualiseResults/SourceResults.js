import React from 'react';
import { compose } from 'recompose';
import { OrderedMap } from 'immutable';
import { withStatementsVisualisation } from 'ui/utils/hocs';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import styles from './styles.css';

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

export const generateTableData = (results, labels, axes) => {
  const seriesList = labels.zip(results);
  const seriesList2 = seriesList.map(([key, item], i) => {
    if (key === undefined) {
      return [`s${i}`, item];
    }
    return [key, item];
  });

  const seriesMap = new OrderedMap(seriesList2);

  const result = seriesMap.reduce((reduction, series, seriesKey) =>

    series.reduce((axesReduction, axes2, axesKey) =>

      axes2.reduce((seriesReduction, item) => {

        return seriesReduction.setIn(
          [item.get('model'), seriesKey, getAxes(axesKey, axes)],
          item
        );
      }, axesReduction)
    , reduction)
  , new OrderedMap());

  return result;
};

export default compose(
  withStatementsVisualisation,
  withStyles(styles)
)(({
  getFormattedResults,
  results,
  labels,
  axes
}) => {
  const formattedResults = getFormattedResults(results);

  const tableData = generateTableData(formattedResults, labels, axes);

  return (
    <div className={styles.sourceResultsContainer}>
      <table className="table table-bordered table-striped">
        <tbody>
          <tr>
            <th />
            {tableData.first().map((item, key) => (
              <th colSpan={item.size}>{key}</th>
            ))}
          </tr>
          <tr>
            <th>i</th>
            {
              tableData.first().map(series => (
                series.map((axes2, axesKey) => (
                  <th>{axesKey}</th>
                ))
              ))
            }
          </tr>
          {tableData.map((item, key) => (
            <tr>
              <td>{key}</td>
              {item.map(series =>
                series.map(axes2 =>
                  (<td>{axes2.get('count')}</td>)
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});
