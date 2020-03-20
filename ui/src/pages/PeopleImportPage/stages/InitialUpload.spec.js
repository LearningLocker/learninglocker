import React from 'react';
import { shallow } from 'enzyme';
import 'jest-enzyme';
import { fromJS } from 'immutable';
import {
  InitialUploadComponent,
  UploadButtonComponent
} from './InitialUpload';

const IN_PROGRESS = 'IN_PROGRESS';
const COMPLETED = 'COMPLETED';
const FAILED = 'FAILED';

describe('InitialUpload', () => {
  it('should render', () => {
    const rendered = shallow(<InitialUploadComponent
      model={fromJS({
        _id: '1'
      })}
      file={({ name: 'fileName' })} />
    );

    expect(rendered).toMatchSnapshot();
  });

  it('should render upload button IN_PROGRESS', () => {
    const rendered = shallow(<UploadButtonComponent
      requestState={IN_PROGRESS} />);

    expect(rendered).toMatchSnapshot();
  });

  it('should render upload button COMPLETED', () => {
    const rendered = shallow(<UploadButtonComponent
      requestState={COMPLETED} />);

    expect(rendered).toMatchSnapshot();
  });

  it('should render upload button FAILED', () => {
    const rendered = shallow(<UploadButtonComponent
      requestState={FAILED} />);

    expect(rendered).toMatchSnapshot();
  });
});
