import React, { PropTypes } from 'react';
import { withProps, compose, setPropTypes, defaultProps } from 'recompose';
import { v4 as uuid } from 'uuid';
import { AutoSizer } from 'react-virtualized';
import NoData from 'ui/components/Graphs/NoData';
import { Map } from 'immutable';
import { withStatementsVisualisation, withModels, withModelCount } from 'ui/utils/hocs';
import { fetchMoreStatements } from 'ui/redux/modules/visualise';
import { connect } from 'react-redux';


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
  withModelCount,
  withProps(() =>
  ({
    updated: (new Date()),
    loading: false,
  }))
  ,
  connect(() => ({}), { fetchMoreStatementsAction: fetchMoreStatements })
);

const columnWidth = {
  wordWrap: 'break-word',
  maxWidth: '150px'
};

export default enhance(({
  count,
  model,
  results,
  fetchMoreStatementsAction
}) => {
  if (results.size) {
    return (
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
                          .map(item => item.replace(/&46;/g, '.')); 
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
          <button
            className="tableButton"
            onClick={() => { fetchMoreStatementsAction(model.get('_id')); }}> {`More results (${results.first().first().size} of ${count})`}</button>
        </div>)
      }</AutoSizer>
    );
  }
  return (<NoData />);
});
