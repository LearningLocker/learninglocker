import React from 'react';
import 'jest-styled-components';
import renderer from 'react-test-renderer';
import { fromJS } from 'immutable';
import TableInput from './index';

describe('TableInput', () => {
  it('Should render table input', () => {
    const tableValue = fromJS({ test1: 'test2' });

    const tableInput = renderer
      .create(
        <TableInput
          values={tableValue}
          onChange={() => {
          }} />
      )
      .toJSON();

    expect(tableInput).toMatchSnapshot();
  });
});
