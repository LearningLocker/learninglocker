import React, { Component } from 'react';
import {
  AutoSizer,
  List as InfiniteList,
  InfiniteLoader,
  CellMeasurer,
  CellMeasurerCache
} from 'react-virtualized';
import { v4 } from 'uuid';

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

  cache = new CellMeasurerCache({
    fixedHight: true,
    defaultHeight: 36,
  });

  renderCellMeasurer = (cellProps) => {
    const { parent, index, style, key, columnIndex } = cellProps;

    const out = (<CellMeasurer
      key={`cellMeasurer-${v4()}`}
      cache={this.cache}
      parent={parent}
      rowIndex={index}
      columnIndex={columnIndex}>
      {(props) => {
        const { measure } = props;

        const ou = renderRow({
          ...this.props.renderRowOptions,
          resetRow: this.resetRow({ resetMeasurementForRow: measure })
        })({ index, style, key });
        return ou;
      }}
    </CellMeasurer>);

    return out;
  }

  render = () => {
    const out = (<InfiniteList
      ref={(ref) => { this.infiniteList = ref; }}
      {...this.props}
      height={this.props.listHeight}
      rowRenderer={this.renderCellMeasurer}
      rowHeight={this.cache.rowHeight} />);

    return out;
  }
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
              width={width - 2}
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
