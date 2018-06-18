import { compose, defaultProps } from 'recompose';
import TextIconButton from './TextIconButton';

const enhanceTextIconButton = compose(
  defaultProps({
    text: 'Confirm',
    icon: 'icon ion-checkmark',
  }),
);

export default enhanceTextIconButton(TextIconButton);

