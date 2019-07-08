import React from 'react';
import PropTypes from 'prop-types';
import SourceResults from 'ui/containers/VisualiseResults/SourceResults';
import BarChartResults from 'ui/containers/VisualiseResults/BarChartResults';

/**
 * @param {string} props.visualisationId
 * @param {boolean} props.showSourceView
 */
const Viewer = ({
  visualisationId,
  showSourceView,
}) => {
  if (showSourceView) {
    return <SourceResults id={visualisationId} />;
  }
  return <BarChartResults id={visualisationId} />;
};

Viewer.propTypes = {
  visualisationId: PropTypes.string.isRequired,
  showSourceView: PropTypes.bool.isRequired,
};

export default React.memo(Viewer);
