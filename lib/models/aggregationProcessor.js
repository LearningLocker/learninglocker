import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';
import scopeChecks from 'lib/models/plugins/scopeChecks';
import { keys } from 'lodash';
import * as scopes from 'lib/constants/scopes';
import filterByOrg from 'lib/models/plugins/filterByOrg';
import addCRUDFunctions from 'lib/models/plugins/addCRUDFunctions';
import timestamps from 'mongoose-timestamp';

/**
 * @typedef {object} AggregationProcessor
 *  @property {*} results
 *  @property {string} pipelineHash
 *  @property {string} pipelineString
 *  @property {string} organisation
 *  @property {string} lrs_id
 *  @property {number} windowSize
 *  @property {number} windowSizeUnits
 *  @property {number} previousWindowSize
 *  @property {number} blockSizeSeconds
 *  @property {boolean} useWindowOptimization
 *  @property {Date} fromTimestamp
 *  @property {Date} toTimestamp
 *  @property {Date} greaterThanDate
 *  @property {Date} lockedAt
 */

/** @typedef {module:mongoose.Model<AggregationProcessor>} AggregationProcessorModel */

/** @class AggregationProcessorSchema */
const aggregationProcessorSchema = new mongoose.Schema({
  results: { type: mongoose.Schema.Types.Mixed },
  pipelineHash: { type: String },
  pipelineString: { type: String }, // the pipeline
  organisation: { type: mongoose.Schema.ObjectId, ref: 'Organisation' },
  lrs_id: { type: mongoose.Schema.ObjectId, ref: 'Lrs' },
  windowSize: { type: Number },
  windowSizeUnits: { type: String, default: 'days' },
  previousWindowSize: { type: Number },
  blockSizeSeconds: { type: Number, default: 604800 /* 1 week */ }, // In seconds
  useWindowOptimization: { type: Boolean, default: false },
  fromTimestamp: { type: Date },
  toTimestamp: { type: Date },
  greaterThanDate: { type: Date },
  lockedAt: { type: Date },
  lastRun: { type: Date },
  lastCompletedRun: { type: Date }
});

aggregationProcessorSchema.index({ pipelineHash: 1, windowSize: 1, windowSizeUnits: 1 });

aggregationProcessorSchema.readScopes = keys(scopes.USER_SCOPES)
  .concat([
    scopes.XAPI_ALL,
    scopes.XAPI_READ,
    scopes.XAPI_STATEMENTS_READ,
    scopes.XAPI_STATEMENTS_READ_MINE,
  ]);
aggregationProcessorSchema.writeScopes = keys(scopes.USER_SCOPES)
  .concat([
    scopes.XAPI_ALL,
    scopes.XAPI_STATEMENTS_WRITE,
  ]);
aggregationProcessorSchema.plugin(scopeChecks);
aggregationProcessorSchema.plugin(filterByOrg);
aggregationProcessorSchema.plugin(addCRUDFunctions);
aggregationProcessorSchema.plugin(timestamps);

const aggregationProcessor = getConnection()
  .model('AggregationProcessor', aggregationProcessorSchema, 'aggregationProcessor');

export default aggregationProcessor;
