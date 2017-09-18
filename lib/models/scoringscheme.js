import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';
import findOrCreate from 'mongoose-findorcreate';
import filterByOrg from 'lib/models/plugins/filterByOrg';
import scopeChecks from 'lib/models/plugins/scopeChecks';
import * as scopes from 'lib/constants/scopes';
import { SCORABLE_KEY_SETTINGS } from 'lib/constants/statements';
import _ from 'lodash';

const defaultScoreIdents = _.reduce(SCORABLE_KEY_SETTINGS, (result, setting, key) => {
  result.push({ key, score: setting.score });
  return result;
}, []);

const keyScore = new mongoose.Schema({
  key: { type: String },
  score: { type: Number }
});

const schema = new mongoose.Schema({
  organisation: { type: mongoose.Schema.ObjectId, ref: 'Organisation' },
  targetScore: { type: Number, default: 4 }, // if an object matches this score it will used as a match
  suggestionScore: { type: Number, default: 2.1 }, // if an object matches this score it will be suggested as a match
  scoredIdents: {
    type: [keyScore],
    default: defaultScoreIdents
  }
});

schema.readScopes = _.keys(scopes.USER_SCOPES);
schema.writeScopes = schema.readScopes;

schema.plugin(scopeChecks);
schema.plugin(findOrCreate);
schema.plugin(filterByOrg);

const ScoringScheme = getConnection().model('ScoringScheme', schema, 'scoringschemes');
export default ScoringScheme;
