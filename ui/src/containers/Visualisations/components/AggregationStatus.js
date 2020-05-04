import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { getWsSeriesModels } from 'ui/redux/modules/visualise';

const aggregationStatusComponent = () => {
  const out = (<span>
    Hello world
  </span>);
  return out;
};

export default compose(
  connect((state, {
    visualisationId
  }) => {
    const models = getWsSeriesModels(visualisationId, state);
    console.log('009 models', models);
    return {
      models
    };
  }, {})
)(aggregationStatusComponent);
