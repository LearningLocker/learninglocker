import React from 'react';
import { withModel } from 'ui/utils/hocs';
import VisualiseIcon from 'ui/components/VisualiseIcon';
import { compose, withProps } from 'recompose';

const GraphIconComponent = ({
  model
}) =>
  (<VisualiseIcon
    type={model.get('type')}
    isSmall
    className="visualisationSmall" />
  );

export default compose(
  withProps({ schema: 'visualisation' }),
  withModel
)(GraphIconComponent);
