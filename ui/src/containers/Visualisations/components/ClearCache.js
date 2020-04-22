import React from 'react';
import { compose, withHandlers, withProps } from 'recompose';
import withModel from 'ui/utils/hocs/withModel';
import { connect } from 'react-redux';
import { start } from 'ui/redux/modules/aggregationWs/deleteAggregation';

const handlers = ({
  onClearCache: ({ visualisationId, start: clearCache }) => () => {
    console.log('onClearCache');
    clearCache({ visualisationId });
  }
});

const ClearCache = ({
  onClearCache
}) => {
  return (<button
    className="btn"
    onClick={onClearCache}>
    Clear cache
  </button>);
};

export default compose(
  // withProps((args) => {
  //   console.log('args', args);
  //   const out = ({
  //     schema: 'visualisation',
  //   });
  //   return out;
  // }),
  // withModel,
  connect(state =>
    state,
  { start }),
  withHandlers(handlers)
)(ClearCache);
