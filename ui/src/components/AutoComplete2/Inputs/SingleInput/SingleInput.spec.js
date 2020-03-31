import React from 'react';
import 'jest-styled-components';
import renderer from 'react-test-renderer';
import SingleInput from './SingleInput';

describe('SingleInput', () => {
  test('should render', () => {
    const mockRenderOption = jest.fn();

    const singleInput = renderer
      .create(<SingleInput selectedOption="test6" renderOption={mockRenderOption} />)
      .toJSON();

    expect(singleInput).toMatchSnapshot();
  });
});
