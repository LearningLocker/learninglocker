import { expect } from 'chai';
import { cursorPosition } from '../textCursor';

describe('cursor position', () => {
  it('should set the correct cursor position', () => {
    const result = cursorPosition({
      oldCursorPosition: 3,
      oldValue: 'abcdefg',
      newValue: 'a b c d e f g',
    });

    expect(result).to.equal(5);
  });

  it('should work on empty string', () => {
    const result = cursorPosition({
      oldCursorPosition: 0,
      oldValue: '',
      newValue: '',
    });

    expect(result).to.equal(0);
  });

  it('should set the position if the oldValue has excess white space', () => {
    const result = cursorPosition({
      oldCursorPosition: 3,
      oldValue: 'a b c d e',
      newValue: 'abcde',
    });

    expect(result).to.equal(2);
  });
});
