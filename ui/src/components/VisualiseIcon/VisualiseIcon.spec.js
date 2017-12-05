import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { withInsertCSS } from 'ui/utils/hocs';
import VisualiseIcon from './index';

const VisualiseIconWrapper = withInsertCSS(VisualiseIcon);

describe('VisualiseIcon', () => {
  it('should render small icon with class visualisationSmall', () => {
    const result = ReactTestRenderer.create(
      <VisualiseIconWrapper
        className="visualisationSmall"
        isSmall
        type="XVSY" />
    ).toJSON();

    expect(result).toMatchSnapshot();
  });
});
