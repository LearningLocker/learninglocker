import React from 'react';
import 'jest-enzyme';
import { shallow } from 'enzyme';
import { Map } from 'immutable';
import { createDefaultTitleWithIcon, getPercentage } from './defaultTitles';
import chevronDownIcon from './assets/ll-chevron-down-icon.svg';

test('defaultTitles should create a title with an icon', () => {
  const model = new Map({
    _id: '1111',
    description: 'dave',
  });

  const rendered = shallow(<div>{createDefaultTitleWithIcon(model)}</div>);
  expect(rendered).toMatchSnapshot();
});

test('defaultTitle should getPercentage', () => {
  const result = getPercentage(50, 100);

  expect(result.result).toEqual('100%');
  expect(result.icon).toBe(chevronDownIcon);
});
