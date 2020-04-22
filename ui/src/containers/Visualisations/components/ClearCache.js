import React from 'react';
import { compose, withHandlers } from 'recompose';
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
  const clearCacheOut = (<button
    className="btn"
    onClick={onClearCache}>
    Clear cache
  </button>);
  return clearCacheOut;
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
