import mongoose from 'mongoose';
import moment from 'moment';
import { getConnection } from 'lib/connections/mongoose';
import { get } from 'lodash';
import timestamps from 'mongoose-timestamp';
import addCRUDFunctions from 'lib/models/plugins/addCRUDFunctions';
import scopeChecks from 'lib/models/plugins/scopeChecks';
import { XAPI_STATEMENTS_DELETE } from 'lib/constants/scopes';
import filterByOrg from 'lib/models/plugins/filterByOrg';

export const getUTCDateTime = (UTCHours, UTCMinutes, dateToAddTimeTo) => {
  // Extract the time and work out the value for today
  const utcDateTime = moment(dateToAddTimeTo).tz('UTC');
  utcDateTime.set('hour', UTCHours);
  utcDateTime.set('minutes', UTCMinutes);
  utcDateTime.set('seconds', 0);
  return utcDateTime;
};

export const getWindowDates = (windowStartUTCHour, windowStartUTCMinute, windowDurationSeconds) => {
  const todaysWindowStartTime = getUTCDateTime(windowStartUTCHour, windowStartUTCMinute, moment());
  const todaysWindowEndTime = moment(todaysWindowStartTime).add(windowDurationSeconds, 'seconds');
  return { todaysWindowStartTime, todaysWindowEndTime };
};

export const inWindow = (siteSettings) => {
  const windowStartUTCHour = get(siteSettings, 'batchDeleteWindowUTCHour');
  const windowStartUTCMinute = get(siteSettings, 'batchDeleteWindowUTCMinutes');
  const windowDurationSeconds = get(siteSettings, 'batchDeleteWindowDurationSeconds');
  // if we have both values then check if we are in the window
  if (windowStartUTCHour && windowStartUTCMinute && windowDurationSeconds) {
    // Extract the time and work out the value for today
    const { todaysWindowStartTime, todaysWindowEndTime } = getWindowDates(windowStartUTCHour, windowStartUTCMinute, windowDurationSeconds);
    // check if the current time is between the start time and the end time
    const insideWindow = moment().isBetween(moment(todaysWindowStartTime), moment(todaysWindowEndTime));
    return insideWindow;
  }
  // otherwise default windowing to true
  return true;
};

export const nextRunAtDateTime = (siteSettings) => {
  const windowStartUTCHour = get(siteSettings, 'batchDeleteWindowUTCHour');
  const windowStartUTCMinute = get(siteSettings, 'batchDeleteWindowUTCMinutes');
  const windowDurationSeconds = get(siteSettings, 'batchDeleteWindowDurationSeconds');
  const { todaysWindowStartTime } = getWindowDates(windowStartUTCHour, windowStartUTCMinute, windowDurationSeconds);

  const nextRunAtDate = moment().isSameOrAfter(todaysWindowStartTime) ? moment().add(1, 'day') : moment();
  return getUTCDateTime(windowStartUTCHour, windowStartUTCMinute, nextRunAtDate);
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
