import { compose, defaultProps } from 'recompose';
import TextIconButton from './TextIconButton';

const enhanceTextIconButton = compose(
  defaultProps({
    text: 'Cancel',
    icon: 'icon ion-close-round',
  }),
);

export default enhanceTextIconButton(TextIconButton);

