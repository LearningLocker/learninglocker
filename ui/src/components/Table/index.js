import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { Grid, AutoSizer, ScrollSync } from 'react-virtualized';
import { range, sum } from 'lodash';
import styles from './styles.css';

const defaultFrozenCellsRenderer = ({ key, style, ...props }) => (
  <div key={key} style={style}>
    <Grid className={styles.frozenCells} {...props} />
  </div>
);

const defaultUnfrozenCellsRenderer = ({ key, style, ...props }) => (
  <div key={key} style={style}>
    <Grid className={styles.cells} {...props} />
  </div>
);

const getCellsSize = (size, numberOfCells) =>
  sum(range(numberOfCells).map(index => size({ index })));

const getCellSize = (frozenSize, frozenCells, size) => index => (
  index === 0 ?
  getCellsSize(frozenSize, frozenCells) :
  size - (getCellsSize(frozenSize, frozenCells))
);

const defaultTableRenderer = ({
  renderFrozenCells = defaultFrozenCellsRenderer,
  renderUnfrozenCells = defaultUnfrozenCellsRenderer,
  renderFrozenCornerCell,
  renderFrozenRowCell,
  renderFrozenColumnCell,
  renderUnfrozenCell,
  unfrozenColumns = 0,
  unfrozenRows = 0,
  columnWidth,
  rowHeight,
  frozenColumnWidth = columnWidth,
  frozenRowHeight = rowHeight,
  frozenRows = 0,
  frozenColumns = 0,
  overscanRowCount = 40,
  width,
  height,
  onSectionRendered = () => null,
  scrollLeft,
  scrollTop,
  onScroll,
}) => (
  <div style={{ width, height }}>
    <Grid
      height={height}
      width={width}
      columnWidth={({ index }) => getCellSize(frozenColumnWidth, frozenColumns, width)(index)}
      rowHeight={({ index }) => getCellSize(frozenRowHeight, frozenRows, height)(index)}
      rowCount={2}
      columnCount={2}
      cellRenderer={({ rowIndex, columnIndex, style }) => {
        if (rowIndex === 0 && columnIndex === 0) {
          return renderFrozenCells({
            key: 'frozenCorner',
            overscanColumnCount: 0,
            overscanRowCount: 0,
            rowCount: frozenRows,
            columnCount: frozenColumns,
            cellRenderer: renderFrozenCornerCell,
            columnWidth: frozenColumnWidth,
            rowHeight: frozenRowHeight,
            width: getCellSize(frozenColumnWidth, frozenColumns, width)(0),
            height: getCellSize(frozenRowHeight, frozenRows, height)(0),
            style,
          });
        }
        if (rowIndex === 0 && columnIndex === 1) {
          return renderFrozenCells({
            key: 'frozenRow',
            overscanColumnCount: 0,
            overscanRowCount: 0,
            rowCount: frozenRows,
            columnCount: unfrozenColumns,
            cellRenderer: renderFrozenRowCell,
            columnWidth,
            rowHeight: frozenRowHeight,
            width: getCellSize(frozenColumnWidth, frozenColumns, width)(1),
            height: getCellSize(frozenRowHeight, frozenRows, height)(0),
            style,
            scrollLeft,
          });
        }
        if (rowIndex === 1 && columnIndex === 0) {
          return renderFrozenCells({
            key: 'frozenColumns',
            overscanColumnCount: 0,
            overscanRowCount: 0,
            rowCount: unfrozenRows,
            columnCount: frozenColumns,
            cellRenderer: renderFrozenColumnCell,
            columnWidth: frozenColumnWidth,
            rowHeight,
            width: getCellSize(frozenColumnWidth, frozenColumns, width)(0),
            height: getCellSize(frozenRowHeight, frozenRows, height)(1),
            style,
            styles,
            scrollTop,
          });
        }
        if (rowIndex === 1 && columnIndex === 1) {
          return renderUnfrozenCells({
            key: 'unfrozen',
            overscanColumnCount: 0,
            overscanRowCount,
            rowCount: unfrozenRows,
            columnCount: unfrozenColumns,
            cellRenderer: renderUnfrozenCell,
            columnWidth,
            rowHeight,
            width: getCellSize(frozenColumnWidth, frozenColumns, width)(1),
            height: getCellSize(frozenRowHeight, frozenRows, height)(1),
            style,
            onSectionRendered,
            scrollLeft,
            scrollTop,
            onScroll,
          });
        }
        throw new Error(`Unexpected row (${rowIndex}) or column (${columnIndex}) index`);
      }} />
  </div>
);

const renderAutoSizeTable = ({
  renderTable = defaultTableRenderer,
  ...props,
}) => (
  <AutoSizer>
    {({ width, height }) => (
      <ScrollSync>
        {({ onScroll, scrollLeft, scrollTop }) => (
          renderTable({
            width,
            height,
            onScroll,
            scrollLeft,
            scrollTop,
            ...props,
          })
        )}
      </ScrollSync>
    )}
  </AutoSizer>
);

export default withStyles(styles)(renderAutoSizeTable);
