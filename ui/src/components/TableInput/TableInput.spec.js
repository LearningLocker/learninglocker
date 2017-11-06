import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { withInsertCSS } from 'ui/utils/hocs';
import { fromJS } from 'immutable';
import TableInput from './index';

describe('TableInput', () => {
  const WrappedTableInput = withInsertCSS(TableInput);

  it('Should render table input', () => {
    const tableValue = fromJS({ test1: 'test2' });

    const tableInput = ReactTestRenderer.create(<WrappedTableInput
      values={tableValue}
      onChange={() => {}} />).toJSON();

    expect(tableInput).toMatchSnapshot();
  });
});
