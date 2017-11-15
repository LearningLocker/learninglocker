import React from 'react';
import { withModel } from 'ui/utils/hocs';
import VisualiseIcon from 'ui/components/VisualiseIcon';
import { compose } from 'recompose';

const GraphIconComponent = ({
  model
}) =>
  (<VisualiseIcon
    type={model.get('type')}
    isSmall="true"
    className="visualisationSmall" />
  );

export default compose(
  withModel
)(GraphIconComponent);
