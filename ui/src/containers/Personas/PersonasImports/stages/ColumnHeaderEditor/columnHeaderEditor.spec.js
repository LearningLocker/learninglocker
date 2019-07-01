import React from 'react';
import { shallow } from 'enzyme';
import 'jest-enzyme';
import { fromJS } from 'immutable';
import {
  ColumnHeaderEditorComponent
} from './index';


describe('ColumnHeaderEditorComponent', () => {
  it('should render', () => {
    const rendered = shallow(<ColumnHeaderEditorComponent
      csvHeaders={fromJS(['test1', 'test2', 'test3'])}
      structure={(fromJS({
        test1: {
          columnName: 'test1'
        },
        test2: {
          columnName: 'test2'
        }
      }))} />);

    expect(rendered).toMatchSnapshot();
  });
});
