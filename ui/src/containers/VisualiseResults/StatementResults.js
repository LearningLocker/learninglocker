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

const makeData = (results, model) => {
  const makeResult = (row, header) => {
    return {
      header,
      row,
    };
  };
  let parsedResults = []
  const out = results
    .first()
    .first()
    .forEach((res) => { 
      console.log('res' , model.get('statementColumns').keySeq().map(e => e))
      let dataObject = {}
      model
        .get('statementColumns')
        .forEach((header) => {
          const headerArray = header.replace(/^\$/, '').split('.');
          if (res.getIn(headerArray, '').toJS) {
            dataObject[header.replace(/^\$/, '')] = JSON.stringify(res.getIn(headerArray, '').toJS())
          } else {
            dataObject[header.replace(/^\$/, '')] = res.getIn(headerArray, '');
          }
        });
       parsedResults.push(dataObject)
    });
    console.log('out',parsedResults)
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
          data={makeData(results, model)}
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
                  { model.get('statementColumns')
                    .map(
                      (header) => {
                        const headerArray = header.replace(/^\$/, '')
                          .split('.')
                          .map(item => item.replace(/&46;/g, '.')); // Not sure if we need this
                        const value = res.getIn(headerArray, '');

                        return (<td style={columnWidth} key={uuid()}>{(value.toJS ?
                          JSON.stringify(value.toJS()) : value) }
                        </td>);
                      }).toList()
                  }
                </tr>)
              ).toList()
            }
            </tbody>
          </table>
        </div>)
      }</AutoSizer>
    ); */}