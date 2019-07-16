import React from 'react';
import 'jest-enzyme';
import { shallow } from 'enzyme';
import { Map, fromJS } from 'immutable';
import { XVSY } from 'lib/constants/visualise';
import { createDefaultTitleWithIcon, getPercentage, getAxesString } from './defaultTitles';
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

test('defaultTitle should getAxesString', () => {
  const model = fromJS({
    axesxValue: {
      searchString: 'The search string'
    }
  });

  const result = getAxesString('x', model);

  expect(result).toEqual('X-Axis');
});

test('defaultTitle should getAxesString for XVSY', () => {
  const model = fromJS({
    axesxValue: {
      searchString: 'The search string'
    }
  });

  const result = getAxesString('x', model, XVSY);

  expect(result).toEqual('The search string');
});
