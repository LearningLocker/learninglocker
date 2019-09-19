import React from 'react';
import { shallow } from 'enzyme';
import 'jest-enzyme';
import { fromJS } from 'immutable';
import { ConfigureUploadComponent } from './ConfigureUpload';

describe('ConfigureUpload', () => {
  it('should render', () => {
    const rendered = shallow(<ConfigureUploadComponent
      model={fromJS({
        csvHeaders: ['test1', 'test2']
      })} />
    );

    expect(rendered).toMatchSnapshot();
  });

  it('should render with errors', () => {
    const rendered = shallow(<ConfigureUploadComponent
      model={fromJS({
        errors: {
          messages: {
            structure: 'Structure is invalid'
          }
        }
      })} />
    );

    expect(rendered).toMatchSnapshot();
  });

  it('should render with disabled', () => {
    const rendered = shallow(<ConfigureUploadComponent
      model={fromJS({
        csvHeaders: ['test1', 'test2']
      })}
      disabled />
    );

    expect(rendered).toMatchSnapshot();
  });
});
