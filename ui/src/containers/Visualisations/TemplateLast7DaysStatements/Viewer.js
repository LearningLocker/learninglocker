import React from 'react';
import PropTypes from 'prop-types';
import CounterResults from 'ui/containers/VisualiseResults/CounterResults';

/**
 * @param {string} props.visualisationId
 */
const Viewer = ({
  visualisationId,
}) => <CounterResults id={visualisationId} />;

Viewer.propTypes = {
  visualisationId: PropTypes.string.isRequired,
};

export default React.memo(Viewer);
