import { Map } from 'immutable';
import { TEMPLATE_LAST_7_DAYS_STATEMENTS } from 'lib/constants/visualise';
import { LAST_7_DAYS } from 'ui/utils/constants';
import { description } from './constants';

/**
 * @param {immutable.Map} model
 * @returns {immutable.Map}
 */
const buildModel = model =>
  model
    .set('type', TEMPLATE_LAST_7_DAYS_STATEMENTS)
    .set('description', description)
    .set('axesoperator', 'uniqueCount')
    .set('axesvalue', new Map({ optionKey: 'statements', searchString: 'Statements' }))
    .set('previewPeriod', LAST_7_DAYS);

export default buildModel;
