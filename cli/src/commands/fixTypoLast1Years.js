import logger from 'lib/logger';
import Visualisation from 'lib/models/visualisation';

const OLD_VALUE = 'LAST_1_YEARS';
const NEW_VALUE = 'LAST_2_YEARS';

export const back = async () => {
  try {
    await Visualisation.updateMany({ previewPeriod: NEW_VALUE }, { $set: { previewPeriod: OLD_VALUE } });
  } catch (error) {
    logger.error(error);
  }
};

export const fix = async () => {
  try {
    await Visualisation.updateMany({ previewPeriod: OLD_VALUE }, { $set: { previewPeriod: NEW_VALUE } });
  } catch (error) {
    logger.error(error);
  }
};

export default fix;
