import React from 'react';
import { compose, withHandlers } from 'recompose';

const handlers = ({
  onClearCache: () => () => {
    console.log('Clear Cache');

    // Delete all the aggregations for the pipelines.
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
  withHandlers(handlers)
)(ClearCache);
