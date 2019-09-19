import React from 'react';
import { shallow } from 'enzyme';
import 'jest-enzyme';
import { fromJS } from 'immutable';
import {
  STAGE_UPLOAD,
  STAGE_CONFIGURE_FIELDS,
  STAGE_IMPORTED
} from 'lib/constants/personasImport';
import { PersonasImportFormComponent } from './PersonasImportForm';

describe('PersonasImportForm', () => {
  it('should render the form in STAGE_UPLOAD', () => {
    const rendered = shallow(<PersonasImportFormComponent
      model={fromJS({
        _id: '1',
        title: '1 title',
        importStage: STAGE_UPLOAD,
        updatedAt: '2017-10-31T06:06:06Z'
      })} />
    );

    expect(rendered).toMatchSnapshot();

    expect(rendered.find('.initialUpload')).toBePresent();
  });

  it('should render the form in STAGE_CONFIGURE_FIELDS', () => {
    const rendered = shallow(<PersonasImportFormComponent
      model={fromJS({
        _id: '1',
        title: '1 title',
        importStage: STAGE_CONFIGURE_FIELDS,
        updatedAt: '2017-10-31T06:06:06Z'
      })} />
    );

    expect(rendered).toMatchSnapshot();

    expect(rendered.find('.configureUpload')).toBePresent();
  });

  it('should render the form in STAGE_IMPORTED', () => {
    const rendered = shallow(<PersonasImportFormComponent
      model={fromJS({
        _id: '1',
        title: '1 title',
        importStage: STAGE_IMPORTED,
        importedAt: '2017-10-31T06:06:06Z'
      })} />
    );
    expect(
      rendered
    ).toMatchSnapshot();

    expect(
      rendered.find('.stageImported')
    ).toBePresent();
  });
});
