import React from 'react';
import 'jest-styled-components';
import renderer from 'react-test-renderer';
import moment from 'moment';
import { fromJS } from 'immutable';
import Criterion from './Criterion.js';

describe('BasicQueryBuilder -> Continuous Criterion', () => {
  it('should render criterion with value', () => {
    const testDate = moment('1986-10-31', 'YYYY-MM-DD');
    const criterion = fromJS({
      timestamp: {
        $gt: {
          $dte: testDate.toISOString()
        }
      }
    });

    const section = fromJS({
      keyPath: ['timestamp'],
      getValueQuery: value => value,
      getQueryDisplay: value => value
    });

    const noop = () => null;

    const criterionOut = renderer
      .create(
        <Criterion
          timezone="Etc/GMT-2"
          orgTimezone="Etc/GMT+3"
          criterion={criterion}
          section={section}
          onCriterionChange={noop}
          onDeleteCriterion={noop} />
      )
      .toJSON();

    expect(criterionOut).toMatchSnapshot();
  });
});
