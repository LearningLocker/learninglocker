import React, { Component } from 'react';
import {
  AutoSizer,
  List as InfiniteList,
  InfiniteLoader,
  CellMeasurer
} from 'react-virtualized';

const isRowLoaded = ({ options }) => ({ index }) => options.has(index);

const renderRow =
  ({ renderOption, onSelectOption, deselectOption, options }) =>
  ({ index, style, key }) => {
    const option = options.get(index, []);
    return (
      <div key={key} style={{ ...style, height: '36px' }}>
        {renderOption({
          key: option[0],
          option: option[1],
          onSelectOption,
          deselectOption,
          index,
        })}
      </div>
    );
  };

class VirtualList extends Component {
  resetRow = ({ resetMeasurementForRow }) => (index) => {
    resetMeasurementForRow(index);
    this.infiniteList.recomputeRowHeights(index);
  }

  render = () => (
    <CellMeasurer
      {...this.props}
      columnCount={1}
      cellRenderer={({ rowIndex, ...rest }) =>
        this.props.cellRenderer({ index: rowIndex, ...rest })
      }>
      {({ getRowHeight, resetMeasurementForRow }) => (
        <InfiniteList
          ref={(ref) => { this.infiniteList = ref; }}
          {...this.props}
          height={this.props.listHeight}
          rowRenderer={renderRow({
            ...this.props.renderRowOptions,
            resetRow: this.resetRow({ resetMeasurementForRow })
          })}
          rowHeight={(args) => {
            const rowHeight = getRowHeight(args);
            return rowHeight;
          }} />
      )}
    </CellMeasurer>
  )
}

const InfiniteOptionList = ({
  options,
  optionCount,
  displayCount = 6,
  rowHeight = 36,
  fetchMore,
  renderOption,
  onSelectOption,
  deselectOption
}) => {
  const rowCount = optionCount || options.size;
  const renderRowOptions = { renderOption, options, onSelectOption, deselectOption };
  const listHeight = Math.min(displayCount, rowCount) * rowHeight;

  return (
    <AutoSizer disableHeight>
      {({ width }) => (
        <InfiniteLoader
          isRowLoaded={isRowLoaded({ options })}
          loadMoreRows={fetchMore}
          rowCount={rowCount} >
          {({ onRowsRendered, registerChild }) => (
            <VirtualList
              options={options}
              ref={registerChild}
              onRowsRendered={onRowsRendered}
              width={width}
              listHeight={listHeight}
              rowCount={rowCount}
              rowHeight={rowHeight}
              renderRowOptions={renderRowOptions}
              cellRenderer={renderRow(renderRowOptions)} />
          )}
        </InfiniteLoader>
      )}
    </AutoSizer>
  );
};

export default InfiniteOptionList;
