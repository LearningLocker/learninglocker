import React, { PropTypes } from 'react';
import { withProps, compose, setPropTypes, defaultProps } from 'recompose';
import { v4 as uuid } from 'uuid';
import { AutoSizer } from 'react-virtualized';
import NoData from 'ui/components/Graphs/NoData';
import { Map } from 'immutable';
import { withStatementsVisualisation, withModels } from 'ui/utils/hocs';
import styles from './styles.css';

const columnWidth = {
  wordWrap: 'break-word',
  maxWidth: '150px'
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
  })
  )
);

export default enhance(({
  model,
  results,
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
    );
  }
  return (<NoData />);
});
