import { compose, defaultProps } from 'recompose';
import TextIconButton from './TextIconButton';

const enhanceTextIconButton = compose(
  defaultProps({
    icon: 'ion ion-plus',
  }),
);

export default enhanceTextIconButton(TextIconButton);

