import React from 'react';
import { compose, withHandlers } from 'recompose';
import { connect } from 'react-redux';
import { start } from 'ui/redux/modules/aggregationWs/deleteAggregation';

const handlers = ({
  onClearCache: ({ visualisationId, start: clearCache }) => () => {
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
  connect(state =>
    state,
  { start }),
  withHandlers(handlers)
)(ClearCache);
