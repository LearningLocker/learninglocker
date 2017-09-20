import { RadioButton } from 'react-toolbox/lib/radio';
import { omitBy, isFunction } from 'lodash';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { compose, withProps } from 'recompose';
import styles from './styles.css';

export default compose(
  withStyles(styles),
  withProps({ theme: omitBy(styles, isFunction) }),
)(RadioButton);
