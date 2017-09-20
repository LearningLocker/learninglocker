import logger from 'lib/logger';
import async from 'async';
import Visualisation from 'lib/models/visualisation';
import _ from 'lodash';

export default function () {
  logger.info('Updating visualisation queries...');
  Visualisation.find({}, (err, visualisations) => {
    async.map(visualisations, (model, next) => {
      // for each key in filters
      model.filters = _.mapValues(model.toObject().filters, filterKey =>
         _.map(filterKey, (filter) => {
           let json = {};
           try {
             json = JSON.parse(filter);
           } catch (err) {
             logger.error(err);
           }
           if (!_.has(json, 'match')) json = { match: json };
           return JSON.stringify(json);
         })
      );
      model.save(next);
    }, (err, results) => {
      if (err) logger.error(err);
      else logger.info(`${results.size} models updated`);
      process.exit();
    });
  });
}
