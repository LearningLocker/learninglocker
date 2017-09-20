/* eslint-disable react/jsx-indent */
import { isString } from 'lodash';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import React, { PropTypes } from 'react';
import { Map } from 'immutable';
import { withProps, compose, setPropTypes, shouldUpdate, defaultProps } from 'recompose';
import { MultiGrid, AutoSizer } from 'react-virtualized';
import { withModels } from 'ui/utils/hocs';
import styles from './styles.css';

const enhance = compose(
  withStyles(styles),
  setPropTypes({
    filter: PropTypes.instanceOf(Map).isRequired,
    project: PropTypes.instanceOf(Map).isRequired,
  }),
  defaultProps({
    filter: new Map(),
    project: new Map()
  }),
  withProps(() => ({
    schema: 'statement',
    first: 1,
    sort: new Map({ timestamp: -1, _id: 1 }),
  })),
  withModels,
  withProps(({ models, project }) => {
    const results = models.map(model =>
      project.map((value, key) => (
        isString(value) ?
        model.getIn(value.replace('$', '').split('.')) :
        model.getIn(key.split('.'))
      ))
    ).toList();
    const headings = project.keySeq();
    return { results, headings };
  }),
  shouldUpdate((props, nextProps) => !(
    props.results.equals(nextProps.results) &&
    props.headings.equals(nextProps.headings)
  )),
  // Generates a date to pass to the MultiGrid in order to force a re-render when props change.
  // This needs to be a function not an object so that the date gets re-generated each time.
  withProps(() =>
    ({
      updated: (new Date()),
    })
  ),
);

const renderHeading = headings =>
  ({ columnIndex, style, key }) => {
    const heading = headings.get(columnIndex);
    return (
      <div className={`${styles.cell} ${styles.header}`} style={style} key={key}>
        { heading }
      </div>
    );
  };

const renderResultContent = (results, headings) =>
  ({ columnIndex, rowIndex, style, key }) => {
    const heading = headings.get(columnIndex);
    const result = results.get(rowIndex);
    const value = result.get(heading);
    const display = value && value.toJS ? JSON.stringify(value.toJS()) : value;

    return (
      <div className={styles.cell} key={key} style={style}>
        <div className={styles.cellWrapper} title={display}>
          {display}
        </div>
      </div>
    );
  };

const renderCell = (results, headings) => {
  const renderHeadingCell = renderHeading(headings);
  const renderResultContentCell = renderResultContent(results, headings);
  return ({ columnIndex, rowIndex, key, style }) =>
    (
      rowIndex === 0
      ? renderHeadingCell({ columnIndex, style, key })
      : renderResultContentCell({ columnIndex, rowIndex: rowIndex - 1, style, key })
    );
};

const render = ({ results, headings, updated }) =>
  (
    <AutoSizer>
      {({ width, height }) =>
        (
          <MultiGrid
            updated={updated}
            cellRenderer={renderCell(results, headings)}
            columnWidth={200}
            columnCount={headings.size}
            fixedRowCount={1}
            rowHeight={40}
            rowCount={results.size + 1}
            width={width}
            height={height} />
        )
      }
    </AutoSizer>
  );

export default enhance(render);
