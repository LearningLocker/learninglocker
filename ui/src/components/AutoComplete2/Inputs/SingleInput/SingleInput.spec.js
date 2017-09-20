import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { withInsertCSS } from 'ui/utils/hocs';
import SingleInput from './SingleInput';

const WrappedSingleInput = withInsertCSS(SingleInput);

test('SingleInput render', () => {
  const mockRenderOption = jest.fn();
  const singleInput = ReactTestRenderer.create(<WrappedSingleInput
    selectedOption="test6"
    renderOption={mockRenderOption} />
  ).toJSON();

  expect(singleInput).toMatchSnapshot();
});
