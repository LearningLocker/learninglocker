import React, { PropTypes } from 'react';
import { withProps, compose, setPropTypes, defaultProps } from 'recompose';
import { v4 as uuid } from 'uuid';
import ReactTable from 'react-table';
import { AutoSizer } from 'react-virtualized';
import NoData from 'ui/components/Graphs/NoData';
import { Map } from 'immutable';
import { withStatementsVisualisation, withModels } from 'ui/utils/hocs';

const columnWidth = {
  wordWrap: 'break-word',
  maxWidth: '150px'
};

const makeData = (results) => {
  const makeResult = (row, header) => {
    return {
      header: header,
      row: row,
    }
  }
  const out = results
    .first()
    .first()
    .map((res) => { 
      return res
        .get('statementColumns')
        .keySeq()
        .map((header) => {
          if (res.get(header, '').toJS) {
            return makeResults(JSON.stringify(res.get(header, '').toJS()), header);
          }                  
          return makeResults(res.get(header, ''), header);
      });
    });
  return out;
}

const makeColumns = (data) => {
  const out = data.map((row) => {
    return {
      Header: row.header,
      accessor: 'row',
      style: { textAlign: 'center' },
      width: 100,
    }
  })
}

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
  })
  )
);

export default enhance(({
  model,
  results,
}) => {
  console.log('TCL:  model,results', model, results);
  if (results.size) {
    return (
      <AutoSizer>{({ height, width }) => (
        <div style={{ overflow: 'auto', height, width, position: 'relative' }}>
          <ReactTable
          data={makeData(results)}
          pageSizeOptions={[15, 25, 50 ,100]}
          defaultPageSize={15}
          columns={makeColumns(results)}
          className="-striped -highlight"
          />
        </div>
      )
      }</AutoSizer>
    )
  }
  return (<NoData />);
});

    {/* return (
      <AutoSizer>{({ height, width }) => (
        <div style={{ overflow: 'auto', height, width, position: 'relative' }}>
          <table className="table table-bordered table-striped">
            <tbody>
              <tr>
                {model.get('statementColumns').keySeq().map((header) => <th style={columnWidth} key={uuid()}>{header}</th>)}
              </tr>
              { results.first().first().map(res =>
                (<tr key={uuid()}>
                  { model.get('statementColumns').keySeq()
                    .map(header => (<td style={columnWidth} key={uuid()}>{(res.get(header, '').toJS ?
                        JSON.stringify(res.get(header, '').toJS()) : res.get(header, '')) }
                    </td>)
                    )
                  }
                </tr>)
              ).toList()
            }
            </tbody>
          </table>
        </div>)
      }</AutoSizer>
    ); */}