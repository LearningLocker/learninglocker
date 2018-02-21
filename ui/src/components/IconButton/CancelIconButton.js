import { compose, withProps } from 'recompose';
import IconButton from './IconButton';

const enhanceIconButton = compose(
  withProps({
    title: 'Cancel',
    icon: 'icon ion-android-cancel',
  }),
);

export default enhanceIconButton(IconButton);

