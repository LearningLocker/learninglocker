import React from 'react';
import { withModel } from 'ui/utils/hocs';
import VisualiseIcon from 'ui/components/VisualiseIcon';
import { compose, withProps } from 'recompose';

const GraphIconComponent = ({
  model, tableIcon = true
}) => (<VisualiseIcon
  type={model.get('type')}
  isSmall
  sourceView={tableIcon && model.get('sourceView')}
  // tableIcon flag temporarily switches tableIcon off for tablised visualisations in the Visualise list
  className="visualisationSmall" />
  );

export default compose(
  withProps({ schema: 'visualisation' }),
  withModel
)(GraphIconComponent);
