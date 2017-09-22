import logger from 'lib/logger';
import visualisation from 'lib/models/visualisation';
import { axesToJsList } from 'lib/helpers/visualisation';
import { VISUALISE_AXES_PREFIX } from 'lib/constants/visualise';
import { fromJS } from 'immutable';
import { includes, assignWith, map, isUndefined, isNull } from 'lodash';

export default function (next = null) {
  logger.info('Migrating visualise axes to root');
  visualisation.find().then((docs) => {
    const promises = map(docs, (doc) => {
      if (!doc.axes) return false;
      try {
        const axes = fromJS(JSON.parse(doc.axes));

        const newAxes = axes.mapEntries(([key, value]) => [VISUALISE_AXES_PREFIX + key, value]);

        const serialisedAxes = newAxes
          .filter((item, key) => includes(axesToJsList, key))
          .map(item => JSON.stringify(item.toJS()));

        const newAxes2 = newAxes.merge(serialisedAxes);

        doc = assignWith(doc, newAxes2.toJS(),
          // don't overwrite if value allready exists.
          (objValue, srcValue) => (
            isUndefined(objValue) ||
            isNull(objValue) ||
            objValue === '' ?
              srcValue : objValue
          )
        );
          // .set('axes', '{}');

        return doc.save();
      } catch (err) {
        console.log('Failed to migrate', doc, err);
        return false;
      }
    });

    return Promise.all(promises);
  }).then(() => {
    logger.info('Migrating visualise axes done');
    if (next) {
      next();
    } else {
      process.exit();
    }
  });
}
