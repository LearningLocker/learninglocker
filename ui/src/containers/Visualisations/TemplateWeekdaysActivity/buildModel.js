import { Map } from 'immutable';
import { TEMPLATE_WEEKDAYS_ACTIVITY } from 'lib/constants/visualise';
import { LAST_7_DAYS } from 'ui/utils/constants';
import { description } from './constants';

/**
 * @param {immutable.Map} model
 * @returns {immutable.Map}
 */
const buildModel = model =>
  model
    .set('type', TEMPLATE_WEEKDAYS_ACTIVITY)
    .set('description', description)
    .set('axesgroup', new Map({ optionKey: 'weekday', searchString: 'Day' }))
    .set('axesoperator', 'uniqueCount')
    .set('axesvalue', new Map({ optionKey: 'statements', searchString: 'Statements' }))
    .set('axesxLabel', 'Day')
    .set('axesyLabel', 'Statements')
    .set('previewPeriod', LAST_7_DAYS);

export default buildModel;
