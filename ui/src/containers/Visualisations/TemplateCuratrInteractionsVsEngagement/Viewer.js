import React from 'react';
import PropTypes from 'prop-types';
import SourceResults from 'ui/containers/VisualiseResults/SourceResults';
import XvsYChartResults from 'ui/containers/VisualiseResults/XvsYChartResults';

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
  return <XvsYChartResults id={visualisationId} />;
};

Viewer.propTypes = {
  visualisationId: PropTypes.string.isRequired,
  showSourceView: PropTypes.bool.isRequired,
};

export default React.memo(Viewer);
