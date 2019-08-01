import { Map } from 'immutable';
import { TEMPLATE_CURATR_ACTIVITIES_WITH_MOST_COMMENTS } from 'lib/constants/visualise';
import { LAST_7_DAYS } from 'ui/utils/constants';
import { title } from './constants';

/**
 * @param {immutable.Map} model
 * @returns {immutable.Map}
 */
const buildModel = model =>
  model
    .set('type', TEMPLATE_CURATR_ACTIVITIES_WITH_MOST_COMMENTS)
    .set('description', title)
    .set('axesgroup', new Map({ optionKey: 'activities', searchString: 'Activity' }))
    .set('axesoperator', 'uniqueCount')
    .set('axesvalue', new Map({ optionKey: 'statements', searchString: 'Statements' }))
    .set('axesxLabel', 'Count')
    .set('axesyLabel', 'Activity name')
    .set('sourceView', true)
    .set('previewPeriod', LAST_7_DAYS);

export default buildModel;
