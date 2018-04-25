import { compose, defaultProps } from 'recompose';
import TextIconButton from './TextIconButton';

const enhanceTextIconButton = compose(
  defaultProps({
    text: 'Next',
    icon: 'icon ion-chevron-right',
  }),
);

export default enhanceTextIconButton(TextIconButton);

