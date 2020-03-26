import React from 'react';
import 'jest-styled-components';
import renderer from 'react-test-renderer';
import VisualiseIcon from './index';

describe('VisualiseIcon', () => {
  it('should render small icon', () => {
    const result = renderer
      .create(
        <VisualiseIcon
          type="XVSY"
          sourceView={false} />
      )
      .toJSON();

    expect(result).toMatchSnapshot();
    expect(result).toHaveStyleRule('height', '30px');
  });
});
