import React from 'react';
import { compose, withProps, shouldUpdate } from 'recompose';
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
  connect(state => ({
    query: statementQuerySelector(state),
    state
  }), {  }),
  withStyles(styles),
  withModels,
  withProps((props) => {
    return { props };
  }),
  withStatementsVisualisation,
  shouldUpdate((props, nextProps) => !(
      props.model.get('statementColumns').equals(nextProps.model.get('statementColumns')) 
    )
  ),
);
// PROBLEM ONE - WHY WONT THE STATE UPDATE WHEN STATEMENT COLUMN CHANGES?
// PROBLEM TWO - HOW TO GET THE SELECTED FIELDS FOR THE FILTERED RESULTS
export default enhance(({
  model,
  query,
  state,
  results,
  props
}) => {
  const pipelines = fromJS([
    [{ $match: query }]
  ]);
  const { activeIndex } = state;
  console.log('sr (mod, pipel, actP, props, results): ', model, pipelines, activeIndex, props, results);
  if (results) {
    return (
      <div style={{ overflow: 'auto', height: '-webkit-fill-available', position: 'relative' }}>
        <table className="table table-bordered table-striped">
          <tbody>
            <tr>
              {model.get('statementColumns').keySeq().map(header => <th key={uuid()}>{header}</th>)}
            </tr>
            { results.first().first().map(res => <tr key={uuid()}><td key={uuid()}>{res}</td></tr>)}
          </tbody>
        </table>
      </div>
    );
  }
  return (<NoData />);
});
