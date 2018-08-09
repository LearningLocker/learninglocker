import React from 'react';
import 'jest-enzyme';
import { createDefaultTitleWithIcon } from './defaultTitles';
import { shallow } from 'enzyme';
import { Map } from 'immutable';

test('defaultTitles should create a title with an icon', () => {
  const model = new Map({
    _id: '1111'
  });
  const name = 'dave';

  const rendered = shallow(<div>{createDefaultTitleWithIcon(model, name)}</div>);
  expect(rendered).toMatchSnapshot();
});
