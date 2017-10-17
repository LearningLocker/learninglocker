import {
  head,
  tail,
} from 'lodash';

/*
  Returns the new cursor position for new value which has added or removed white space
  to the old value.
*/
export const cursorPosition = ({ // eslint-disable-line import/prefer-default-export
  oldCursorPosition,
  oldValue,
  newValue,
  acc = 0,
}) => {
  if (oldCursorPosition === 0) {
    return acc;
  }

  if (head(newValue) === head(oldValue)) {
    return cursorPosition({
      oldCursorPosition: oldCursorPosition - 1,
      oldValue: tail(oldValue),
      newValue: tail(newValue),
      acc: acc + 1
    });
  }

  if (head(newValue).match(/\s/)) {
    return cursorPosition({
      oldCursorPosition,
      oldValue,
      newValue: tail(newValue),
      acc: acc + 1
    });
  }

  if (head(oldValue).match(/\s/)) {
    return cursorPosition({
      oldCursorPosition: oldCursorPosition - 1,
      oldValue: tail(oldValue),
      newValue,
      acc
    });
  }

  // Something went wrong
  return acc;
};
