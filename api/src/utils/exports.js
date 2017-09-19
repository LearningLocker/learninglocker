import csv from 'fast-csv';
import Statement from 'lib/models/statement';
import highland from 'highland';
import async from 'async';
import _ from 'lodash';
import Promise from 'bluebird';

export function groupStreams(streams) {
  const mappingFunction = value => _.mapValues(value, (val) => {
    if (_.isString(val)) return val;
    const jsonVal = JSON.stringify(val);
    if (jsonVal[0] === '"') return `${val}`;
    return jsonVal;
  });
  if (_.size(streams) === 1) return streams[0].map(mappingFunction);

  return highland(streams)
    .merge()
    .map(mappingFunction)
    .group('_id')
    .map(val => _.map(val, values => _.merge.apply(_, [{}, ...values])))
    .flatten();
}

export const streamToCsv = (headers, stream) => new Promise((resolve, reject) => {
  const csvStream = csv.createWriteStream({ headers });
  stream.pipe(csvStream);
  csvStream.on('error', reject);
  stream.on('error', reject);
  return resolve(csvStream);
});

export const exportCSV = ({ authInfo, pipelines }) => new Promise((resolve, reject) => {
  const headers = pipelines.reduce((result, pipeline) => {
    const projections = pipeline.filter(stage => stage.$project !== undefined);
    const lastProjection = projections[projections.length - 1].$project;
    const projectedHeaders = Object.keys(lastProjection);
    const visibleHeaders = projectedHeaders.filter(projectedHeader => (
      lastProjection[projectedHeader] !== 0
    ));
    return _.union(result, visibleHeaders);
  }, []);

  async.map(
    pipelines,
    (pipeline, next) =>
      Statement.aggregateByAuth(authInfo, pipeline, {
        batchSize: 100,
        limit: 500000,
        getStream: true,
        maxTimeMS: 0,
        maxScan: 0,
      }, next),
    (err, streams) => {
      if (err) reject(err);
      const highlandStreams = _.map(streams, highland);
      const highlandStream = groupStreams(highlandStreams);
      resolve(streamToCsv(headers, highlandStream));
    }
  );
});
