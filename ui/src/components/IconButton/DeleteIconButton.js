import { compose, withProps } from 'recompose';
import IconButton from './IconButton';

const enhanceIconButton = compose(
  withProps({
    title: 'Delete',
    icon: 'icon ion-trash-b',
  }),
);

export default enhanceIconButton(IconButton);

