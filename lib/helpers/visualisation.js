import isString from 'lodash/isString';
import includes from 'lodash/includes';
import { VISUALISE_AXES_PREFIX } from 'lib/constants/visualise';
import { fromJS } from 'immutable';

/**
 * unflatten axes properties
 *
 * Filter axes keys and remove VISUALISE_AXES_PREFIX ("axes") from the keys
 *
 * e.g.
 *
 * visualisation = new immutable.Map({
 *   axesxLabel: 'X-Axes',
 *   axesxValue: {...},
 *   unrelatedProp: ... },
 * );
 *
 * unflattenAxes(visualisation);
 *
 * // immutable.Map({
 * //  xLabel: 'X-Axes',
 * //  xValue: {...},
 * // });
 *
 * @param {immutable.Map} visualisation
 * @returns {immutable.Map} - axes
 */
export const unflattenAxes = visualisation =>
  visualisation
    .filter((_, key) => key.startsWith(VISUALISE_AXES_PREFIX) && key.length > VISUALISE_AXES_PREFIX.length)
    .mapKeys(key => key.slice(VISUALISE_AXES_PREFIX.length));


export const axesToJsList = ['axesgroup', 'axesxValue', 'axesyValue', 'axesvalue', 'axesxQuery', 'axesyQuery', 'axesquery'];
/**
 * deserialise axes properties
 *
 * { axesxLabel: 'X-Axes', axesxValue: '{\'stringified\': \'json\'}', unrelatedProp: '...'}
 * becomes:
 * {axesxLabel: 'X-Axes', axesxValue: {stringified: json}, unrelatedProp: '...'}
 * keyPrefix: if we're deserialising unflattenedAxes, we may wish to set this to VISUALISE_AXES_PREFIX, to match against the axesToJsList.
 */
export const deserialiseAxes = (visualisation, keyPrefix = '') => {
  const out = visualisation
    .filter((item, key1) => isString(item) && includes(axesToJsList, keyPrefix + key1))
    .map(item => fromJS(JSON.parse(item)));

  return visualisation.merge(out);
};
