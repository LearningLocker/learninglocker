import { compose, withProps } from 'recompose';
import TextIconButton from './TextIconButton';

const enhanceTextIconButton = compose(
  withProps({
    icon: 'ion ion-plus',
  }),
);

export default enhanceTextIconButton(TextIconButton);

