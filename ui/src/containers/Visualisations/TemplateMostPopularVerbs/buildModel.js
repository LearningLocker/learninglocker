import { Map } from 'immutable';
import { TEMPLATE_MOST_POPULAR_VERBS } from 'lib/constants/visualise';
import { LAST_2_MONTHS } from 'ui/utils/constants';
import { description } from './constants';

/**
 * @param {immutable.Map} model
 * @returns {immutable.Map}
 */
const buildModel = model =>
  model
    .set('type', TEMPLATE_MOST_POPULAR_VERBS)
    .set('description', description)
    .set('axesgroup', new Map({ optionKey: 'verb', searchString: 'Verb' }))
    .set('axesoperator', 'uniqueCount')
    .set('axesvalue', new Map({ optionKey: 'statements', searchString: 'Statements' }))
    .set('axesxLabel', 'Statements')
    .set('axesyLabel', 'Verb')
    .set('previewPeriod', LAST_2_MONTHS);

export default buildModel;
