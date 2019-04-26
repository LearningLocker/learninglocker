import mongoose from 'mongoose';
import moment from 'moment';
import { getConnection } from 'lib/connections/mongoose';
import { get } from 'lodash';
import timestamps from 'mongoose-timestamp';
import addCRUDFunctions from 'lib/models/plugins/addCRUDFunctions';
import scopeChecks from 'lib/models/plugins/scopeChecks';
import { XAPI_STATEMENTS_DELETE } from 'lib/constants/scopes';
import filterByOrg from 'lib/models/plugins/filterByOrg';

export const getUTCDateTime = (dateToGetTimeFrom, dateToAddTimeTo) => {
  // Extract the time and work out the value for today
  const utcDateTime = moment(dateToAddTimeTo).tz('UTC');
  utcDateTime.set('hour', dateToGetTimeFrom.getHours());
  utcDateTime.set('minutes', dateToGetTimeFrom.getMinutes());
  utcDateTime.set('seconds', dateToGetTimeFrom.getSeconds());
  return utcDateTime;
};

export const getWindowDates = (windowStartTime, windowDurationSeconds) => {
  const todaysWindowStartTime = getUTCDateTime(windowStartTime, moment());
  const todaysWindowEndTime = moment(todaysWindowStartTime).add(windowDurationSeconds, 'seconds');
  return { todaysWindowStartTime, todaysWindowEndTime };
};

export const inWindow = (siteSettings) => {
  // The batchDeleteWindowStartTime is a UTC date
  const windowStartTime = get(siteSettings, 'batchDeleteWindowStartTime');
  const windowDurationSeconds = get(siteSettings, 'batchDeleteWindowDuration');

  // if we have both values then check if we are in the window
  if (windowStartTime && windowDurationSeconds) {
    // Extract the time and work out the value for today
    const { todaysWindowStartTime, todaysWindowEndTime } = getWindowDates(windowStartTime, windowDurationSeconds);

    // check if the current time is between the start time and the end time
    const insideWindow = moment().isBetween(moment(todaysWindowStartTime), moment(todaysWindowEndTime));
    return insideWindow;
  }
  // otherwise default windowing to true
  return true;
};

export const nextRunAtDateTime = (siteSettings) => {
  const windowStartTime = get(siteSettings, 'batchDeleteWindowStartTime');
  const windowDurationSeconds = get(siteSettings, 'batchDeleteWindowDuration');
  const { todaysWindowStartTime } = getWindowDates(windowStartTime, windowDurationSeconds);

  const nextRunAtDate = moment().isSameOrAfter(todaysWindowStartTime) ? moment().add(1, 'day') : moment();
  return getUTCDateTime(windowStartTime, nextRunAtDate);
};

const schema = new mongoose.Schema({
  client: { type: mongoose.Schema.ObjectId, ref: 'Client', index: true },
  organisation: { type: mongoose.Schema.ObjectId, ref: 'Organisation', index: true },
  pageSize: { // No of documents to delete at a time.
    type: Number,
    default: 1000
  },
  total: {
    type: Number
  },
  deleteCount: {
    type: Number
  },
  // Before scope filter.
  filter: { type: String },
  processing: { type: Boolean, default: false },
  done: { type: Boolean, default: false },
});

schema.readScopes = [XAPI_STATEMENTS_DELETE];
schema.writeScopes = schema.readScopes;

schema.plugin(timestamps);
schema.plugin(scopeChecks);
schema.plugin(filterByOrg);
schema.plugin(addCRUDFunctions);

const BatchDelete = getConnection().model('BatchDelete', schema, 'batchDelete');
export default BatchDelete;
