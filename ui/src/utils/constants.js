import { STAGE_PROCESSING } from 'lib/constants/personasImport';

// Preview Period
export const TODAY = 'TODAY';
export const LAST_7_DAYS = 'LAST_7_DAYS';
export const LAST_30_DAYS = 'LAST_30_DAYS';
export const LAST_2_MONTHS = 'LAST_2_MONTHS';
export const LAST_6_MONTHS = 'LAST_6_MONTHS';
export const LAST_24_HOURS = 'LAST_24_HOURS';
export const LAST_1_YEAR = 'LAST_1_YEAR';
export const LAST_2_YEARS = 'LAST_2_YEARS';

export const TYPES = 'stages/TYPES';
export const STORES = 'stages/STORES';
export const NONE = 'stages/NONE';

export const FIVE = 5;
export const TEN = 10;
export const FIFTEEN = 15;
export const TWENTY = 20;


export const IN_PROGRESS = 'IN_PROGRESS';
export const COMPLETED = 'COMPLETED';
export const FAILED = 'FAILED';

export const keyCodes = {
  ENTER: 13,
  UP: 38,
  DOWN: 40,
  BACKSPACE: 8,
  ESC: 27
};

/**
 * if the schema needs to be pushed back throug the worker,
 * the progress bar will need these by default for UI,
 * state which fields corresponds in the model
 * @param  {String}   statusObject    the main object where all the others reside
 * @param  {String}   inProgress      bool for the worker queue in progress
 * @param  {String}   totalCount      how many the work has to do total
 * @param  {String}   remainingCount  how many does the worker have left
 */
export const PROGRESS_MODELS = {
  importcsv: {
    statusObject: 'uploadStatus',
    inProgress: 'inProgress',
    totalCount: 'totalCount',
    remainingCount: 'remainingCount'
  },
  personasImport: {
    statusObject: 'importStage',
    inProgress: status => status === STAGE_PROCESSING,
    getTotalCount: model => model.get('totalCount'),
    getProcessedCount: model => model.get('processedCount')
  }
};

export const VISUALISATION_COLORS = ['#F5AB36', '#DB0A5B', '#36D7B7', '#9B59B6', '#F77F3F', '#1E8BC3', '#ED4444'];
