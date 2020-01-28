import 'jest-enzyme';
import { shallow } from 'enzyme';
import { Map } from 'immutable';
import { createDefaultTitleWithIcon, getPercentage } from './defaultTitles';
import chevronDownIcon from './assets/ll-chevron-down-icon.svg';

describe('defaultTitles', () => {
  test('should create a title with an icon', () => {
    const model = new Map({
      _id: '1111',
      description: 'dave',
    });

    const rendered = shallow(createDefaultTitleWithIcon(model));

    expect(rendered).toMatchSnapshot();
  });

  test('should getPercentage', () => {
    const result = getPercentage(50, 100);

    expect(result.result).toEqual('100%');

    expect(result.icon).toBe(chevronDownIcon);
  });
});
