import { Map } from 'immutable';
import { TEMPLATE_ACTIVITY_OVER_TIME } from 'lib/constants/visualise';
import { LAST_2_MONTHS } from 'ui/utils/constants';
import { description } from './constants';

/**
 * @param {immutable.Map} model
 * @returns {immutable.Map}
 */
const buildModel = model =>
  model
    .set('type', TEMPLATE_ACTIVITY_OVER_TIME)
    .set('description', description)
    .set('axesoperator', 'uniqueCount')
    .set('axesvalue', new Map({ optionKey: 'statements', searchString: 'Statements' }))
    .set('axesxLabel', 'Date')
    .set('axesyLabel', 'Statements')
    .set('previewPeriod', LAST_2_MONTHS);

export default buildModel;
