import { compose, withProps } from 'recompose';
import IconButton from './IconButton';

const enhanceIconButton = compose(
  withProps({
    title: 'Add',
    icon: 'ion ion-plus',
  }),
);

export default enhanceIconButton(IconButton);

