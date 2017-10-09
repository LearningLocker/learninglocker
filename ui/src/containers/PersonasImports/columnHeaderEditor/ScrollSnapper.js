import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import {
  compose,
  withHandlers
} from 'recompose';
import {
  reduce,
  debounce
} from 'lodash';
import styles from './styles.css';

const calculateNewOffset = ({
  element
}) => {
  const scrollLeft = element.scrollLeft;

  if (scrollLeft + element.offsetWidth > element.scrollWidth - 110) {
    element.scrollLeft = element.scrollWidth - element.offsetWidth;
    return;
  }

  const {
    offset: toOffset
  } = reduce(element.childNodes, ({ diff, offset }, childEl) => {
    const newDiff = Math.abs(scrollLeft - childEl.offsetLeft);

    if (newDiff < diff) {
      return {
        diff: newDiff,
        offset: childEl.offsetLeft - 2 // - 2 for the margin
      };
    }
    return {
      diff,
      offset
    };
  }, {
    diff: Infinity,
    offset: 0,
  });

  element.scrollLeft = toOffset;
};

const calculateNewOffsetDebounced = debounce(calculateNewOffset, 500);

const scrollManagerHandlers = withHandlers({
  onContainerScroll: () => (event) => {
    calculateNewOffsetDebounced({ element: event.target });
  }
});

const render = ({
  children,
  onContainerScroll
}) =>
  (
    <div
      className={styles.container}
      onScroll={onContainerScroll}>
      <div className={styles.content}>;
        {children}
      </div>
    </div>
  );

export default compose(
  withStyles(styles),
  scrollManagerHandlers
)(render);
