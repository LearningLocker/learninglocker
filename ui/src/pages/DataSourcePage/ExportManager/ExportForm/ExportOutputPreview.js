/* eslint-disable react/jsx-indent */
import { isString } from 'lodash';
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { withProps, compose, setPropTypes, shouldUpdate, defaultProps } from 'recompose';
import { MultiGrid, AutoSizer } from 'react-virtualized';
import { withModels } from 'ui/utils/hocs';

const Cell = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: baseline;
  text-align: left;
  padding: 0 1em 0 0;
  white-space: nowrap;
`;

const CellWrapper = styled.div`
  overflow: hidden;
  width: 100%;
`;

const HeaderCell = styled(Cell)`
  border-bottom: 2px solid #ddd;
  font-weight: bold;
`;

const enhance = compose(
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
      <HeaderCell style={style} key={key}>
        {heading}
      </HeaderCell>
    );
  };

const renderResultContent = (results, headings) =>
  ({ columnIndex, rowIndex, style, key }) => {
    const heading = headings.get(columnIndex);
    const result = results.get(rowIndex);
    const value = result.get(heading);
    const display = value && value.toJS ? JSON.stringify(value.toJS()) : value;

    return (
      <Cell key={key} style={style}>
        <CellWrapper title={display}>
          {display}
        </CellWrapper>
      </Cell>
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
