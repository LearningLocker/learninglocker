import React from 'react';
import { compose, withProps } from 'recompose';
import { withModel } from 'ui/utils/hocs';
import SavedRowEditor from './SavedRowEditor';
import SavedRowViewer from './SavedRowViewer';

const enhance = compose(
  withProps({ schema: 'personaAttribute' }),
  withModel
);

const render = ({ id, getMetadata }) => {
  const isChanging = getMetadata('isChanging', false);
  return isChanging ? <SavedRowEditor id={id} /> : <SavedRowViewer id={id} />;
};

export default enhance(render);
