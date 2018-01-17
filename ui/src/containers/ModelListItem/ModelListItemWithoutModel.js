import {
  withProps,
  withStateHandlers,
  compose
} from 'recompose';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { Map } from 'immutable';
import { ModelListItem } from './index';
import styles from './modellistitem.css';

// Doesn't use the with model hoc, uses the raw immutable js model.

const stateHandlers = withStateHandlers(() => ({
  metadata: new Map()
}), {
  setMetadata: ({ metadata }) => (key, value) =>
    ({
      metadata: metadata.set(key, value)
    })
});

const stateProps = withProps(({ metadata }) => ({
  getMetadata: key => metadata.get(key)
}));

export default compose(
  stateHandlers,
  stateProps,
  withStyles(styles)
)(ModelListItem);
