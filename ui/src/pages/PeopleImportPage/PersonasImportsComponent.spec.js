import React from 'react';
import { shallow } from 'enzyme';
import 'jest-enzyme';
import { PersonasImportsComponent } from './index';

describe('PersonasImports with items', () => {
  it('should render', () => {
    const rendered = shallow(
      <PersonasImportsComponent
        onAddModel={jest.fn()} />
    );

    expect(rendered).toMatchSnapshot();
  });
});
