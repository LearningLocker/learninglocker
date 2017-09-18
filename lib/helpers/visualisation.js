import isString from 'lodash/isString';
import includes from 'lodash/includes';
import { VISUALISE_AXES_PREFIX } from 'lib/constants/visualise';
import { fromJS } from 'immutable';


// unflatterns axes propersies
// {axesxLabel: 'X-Axes', axesxValue: '{...}', unrelatedProp: '...'}
// becomes:
// {xLabel: 'X-Axes', xValue: '{...}'}
export const unflattenAxes = (visualisation) => {
  const axes = visualisation
    .filter((item, key) => key.startsWith(VISUALISE_AXES_PREFIX) && key.length > VISUALISE_AXES_PREFIX.length)
    .mapKeys((key) => {
      const newKey = key.slice(VISUALISE_AXES_PREFIX.length);
      return newKey;
    });

  return axes;
};

export const axesToJsList = ['axesgroup', 'axesxValue', 'axesyValue', 'axesvalue', 'axesxQuery', 'axesyQuery', 'axesquery'];
// deserilaises axes properties
// { axesxLabel: 'X-Axes', axesxValue: '{\'stringified\': \'json\'}', unrelatedProp: '...'}
// becomes:
// {axesxLabel: 'X-Axes', axesxValue: {stringified: json}, unrelatedProp: '...'}
// keyPrefix: if we're deserilaising unflattenedAxes, we may wish to set this to VISUALISE_AXES_PREFIX, to match against the axesToJsList.
export const deserialiseAxes = (visualisation, keyPrefix = '') => {
  const out = visualisation
    .filter((item, key1) => isString(item) && includes(axesToJsList, keyPrefix + key1))
    .map(item => fromJS(JSON.parse(item)));

  return visualisation.merge(out);
};
