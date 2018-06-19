import { compose, defaultProps } from 'recompose';
import TextIconButton from './TextIconButton';

const enhanceTextIconButton = compose(
  defaultProps({
    text: 'Previous',
    icon: 'icon ion-chevron-left',
  }),
);

export default enhanceTextIconButton(TextIconButton);

