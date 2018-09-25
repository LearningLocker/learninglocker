import React, { PropTypes } from 'react';
import { withProps, compose, setPropTypes, defaultProps } from 'recompose';
import ReactTable from 'react-table';
import { AutoSizer } from 'react-virtualized';
import NoData from 'ui/components/Graphs/NoData';
import { Map } from 'immutable';
import { withStatementsVisualisation, withModels } from 'ui/utils/hocs';

const makeData = (results, model) => {

  const serialisedData = [];
  results
    .first()
    .first()
    .forEach((res) => {
      const columnObject = {};
      model
        .get('statementColumns')
        .forEach((value, key) => {
          const valueArray = value.replace(/^\$/, '').split('.');
          if (res.getIn(valueArray, '').toJS) {
            columnObject[key] = JSON.stringify(res.getIn(valueArray, '').toJS());
          } else {
            columnObject[key] = res.getIn(valueArray, '');
          }
        });
      serialisedData.push(columnObject);
    });
  return serialisedData;
};

const makeColumns = (model) => {
  const columns = [];
  model.get('statementColumns').forEach((value, key) => {
    columns.push({
      Header: key,
      accessor: key,
      style: { textAlign: 'left' },
    });
  });
  return columns;
};

const getPageOptions = (pages) => {
  const pageOptions = [25, 50, 100];
  return [10].concat(pageOptions.filter(option => option < pages));
};
const enhance = compose(
  withStatementsVisualisation,
  setPropTypes({
    filter: PropTypes.instanceOf(Map).isRequired,
    project: PropTypes.instanceOf(Map).isRequired,
  }),
  defaultProps({
    filter: new Map(),
    project: new Map()
  }),
  withModels,
  withProps(() =>
  ({
    updated: (new Date()),
    loading: false
  })
  )
);

export default enhance(({
  model,
  results,
  loading
}) => {
  if (results.size) {
    return (
      <AutoSizer>{({ height, width }) => (
        <div style={{ overflow: 'auto', height: Math.round(height) + 10, width, position: 'relative' }}>
          <ReactTable
            data={makeData(results, model)}
            pageSizeOptions={[10, 25, 50, 100]}
            pageSizeOptions={getPageOptions(makeData(results, model).length)}
            defaultPageSize={10}
            // manual
            loading={loading}
            columns={makeColumns(model)} />
        </div>
      )}</AutoSizer>
    );
  }
  return (<NoData />);
});
