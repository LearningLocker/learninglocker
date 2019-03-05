/* eslint-disable import/no-mutable-exports */
import { getConnection } from 'lib/connections/mongoose';
import { schema } from './statement';

const StatementSample = getConnection().model('StatementSample', schema, 'statementSamples');
export default StatementSample;
