import React, { PropTypes }  from 'react';
import { withProps, compose, setPropTypes, defaultProps } from 'recompose';
import { connect } from 'react-redux';
import { v4 as uuid } from 'uuid';
import NoData from 'ui/components/Graphs/NoData';
import { statementQuerySelector } from 'ui/redux/selectors';
import { Map, fromJS } from 'immutable';
import isString from 'lodash/isString';
import { withStatementsVisualisation, withModels } from 'ui/utils/hocs';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import styles from './styles.css';
import { displayVerb, displayActivity } from '../../utils/xapi';
import { MultiGrid, AutoSizer } from 'react-virtualized';

const formatKeyToFriendlyString = (key) => {
  if (isString(key)) return key;

  if (Map.isMap(key)) {
    if (key.get('objectType')) {
      return displayActivity(key);
    }
    if (key.get('display')) {
      return displayVerb(key);
    }
    if (key.has('id')) {
      return key.get('id');
    }

    return JSON.stringify(key.toJS(), null, 2);
  }

  return JSON.stringify(key, null, 2);
};

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
  console.log('TCL: renderCell -> results, headings', results, headings);
    const renderHeadingCell = renderHeading(headings);
    const renderResultContentCell = renderResultContent(results, headings);
    return ({ columnIndex, rowIndex, key, style }) =>
      (
        rowIndex === 0
        ? renderHeadingCell({ columnIndex, style, key })
        : renderResultContentCell({ columnIndex, rowIndex: rowIndex - 1, style, key })
      );
  };

// onAddQuery = () => {
//   const { model } = this.props;
//   const queries = model.get('filters');
//   const modelId = model.get('_id');
//   const newQueries = queries.push(new Map());
//   this.props.updateModel({
//     schema: 'visualisation',
//     id: modelId,
//     path: 'filters',
//     value: newQueries
//   });
// }

const enhance = compose(
  withStyles(styles),
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
  withProps(({ models, project }) => {
    const results = models && models.map(model =>
      project.map((value, key) => (
        isString(value) ?
        model.getIn(value.replace('$', '').split('.')) :
        model.getIn(key.split('.'))
      ))
    ).toList();
    const headings = project.keySeq();
    return { results, headings };
  }),
  withProps(() =>
  ({
    updated: (new Date()),
  })
  )
);
// PROBLEM ONE - WHY WONT THE STATE UPDATE WHEN STATEMENT COLUMN CHANGES?
// PROBLEM TWO - HOW TO GET THE SELECTED FIELDS FOR THE FILTERED RESULTS
export default enhance(({
  results,
  headings,
  updated
}) => {

  console.log('res_parsed', results, 'headings', headings);
  // const pipelines = fromJS([
  //   [{ $match: query }]
  // ]);
  // const { activeIndex } = state;

        // <div style={{ overflow: 'auto', height: '-webkit-fill-available', position: 'relative' }}>
      //   <table className="table table-bordered table-striped">
      //     <tbody>
      //       <tr>
      //         {model.get('statementColumns').keySeq().map(header => <th key={uuid()}>{header}</th>)}
      //       </tr>
      //       { results.first().first().map(res => <tr key={uuid()}><td key={uuid()}>{res}</td></tr>)}
      //     </tbody>
      //   </table>
      // </div>
  
  if (results.size) {
    return (
      <AutoSizer>
      {({ width, height }) =>{
        console.log('width, height', width, height);
        return (
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
        );
      }
    }
    </AutoSizer>
    );
  }
  return (<NoData />);
});
