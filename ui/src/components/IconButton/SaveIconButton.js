import { compose, withProps } from 'recompose';
import IconButton from './IconButton';

const enhanceIconButton = compose(
  withProps({
    title: 'Save',
    icon: 'glyphicon glyphicon-floppy-disk',
  }),
);

export default enhanceIconButton(IconButton);

