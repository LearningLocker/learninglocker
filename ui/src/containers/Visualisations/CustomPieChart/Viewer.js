import React from 'react';
import PropTypes from 'prop-types';
import SourceResults from 'ui/containers/VisualiseResults/SourceResults';
import PieChartResults from 'ui/containers/VisualiseResults/PieChartResults';

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
  return <PieChartResults id={visualisationId} />;
};

Viewer.propTypes = {
  visualisationId: PropTypes.string.isRequired,
  showSourceView: PropTypes.bool.isRequired,
};

export default React.memo(Viewer);
