import {
  TRIBAL_INSIGHT,
  LAP,
  SSP,
  STUDENT_APP,
  OPENDASH
} from 'lib/constants/scopes';
import getJiscModelFilter from 'lib/services/auth/filters/getJiscModelFilter';

export default async (opts) => {
  switch (opts.modelName.toLowerCase()) {
    case 'assessmentinstance':
    case 'course':
    case 'courseinstance':
    case 'studentcourseinstance':
    case 'studentcoursemembership':
      return getJiscModelFilter([TRIBAL_INSIGHT, LAP, SSP])(opts);
    case 'institution':
    case 'student':
    case 'studentmoduleinstance':
      return getJiscModelFilter([
        STUDENT_APP,
        TRIBAL_INSIGHT,
        LAP,
        SSP,
        OPENDASH
      ])(opts);
    case 'module':
    case 'moduleinstance':
      return getJiscModelFilter([TRIBAL_INSIGHT, LAP, SSP, OPENDASH])(opts);
    case 'modulevlemap':
      return getJiscModelFilter([STUDENT_APP, TRIBAL_INSIGHT, LAP, OPENDASH])(
        opts
      );
    case 'staff':
    case 'staffmoduleinstance':
      return getJiscModelFilter([TRIBAL_INSIGHT, SSP, OPENDASH])(opts);
    case 'staffcourseinstance':
      return getJiscModelFilter([TRIBAL_INSIGHT, SSP])(opts);
    case 'studentassessmentinstance':
      return getJiscModelFilter([STUDENT_APP, TRIBAL_INSIGHT, LAP, SSP])(opts);
    default:
      throw new Error('No scope filter');
  }
};
