import { Map } from 'immutable';
import { TEMPLATE_LEARNING_EXPERIENCE_TYPE } from 'lib/constants/visualise';
import { LAST_7_DAYS } from 'ui/utils/constants';
import { description } from './constants';

/**
 * @param {immutable.Map} model
 * @returns {immutable.Map}
 */
const buildModel = model =>
  model
    .set('type', TEMPLATE_LEARNING_EXPERIENCE_TYPE)
    .set('description', description)
    .set('axesgroup', new Map({ optionKey: 'statement.context.contextActivities.grouping', searchString: 'statement.context.contextActivities.grouping' }))
    .set('axesoperator', 'uniqueCount')
    .set('axesvalue', new Map({ optionKey: 'statements', searchString: 'Statements' }))
    .set('axesxLabel', 'Statements')
    .set('axesyLabel', 'Learning Experience Types')
    .set('previewPeriod', LAST_7_DAYS);

export default buildModel;
