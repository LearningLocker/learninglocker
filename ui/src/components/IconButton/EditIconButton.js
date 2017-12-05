import { compose, withProps } from 'recompose';
import IconButton from './IconButton';

const enhanceIconButton = compose(
  withProps({
    title: 'Edit',
    icon: 'ion ion-edit',
  }),
);

export default enhanceIconButton(IconButton);

