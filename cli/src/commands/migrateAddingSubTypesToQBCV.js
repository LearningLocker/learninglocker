import _ from 'lodash';
import logger from 'lib/logger';
import {
  SUBTYPE_ACTIVITY,
  SUBTYPE_AGENT,
  SUBTYPE_VERB,
} from 'lib/constants/queryBuilderCacheValues';
import QueryBuilderCacheValue from 'lib/models/querybuildercachevalue';


export const removeSubTypesFromQBCV = async () => {
  logger.info('Start removing subTypes from QueryBuilderCacheValue');
  await QueryBuilderCacheValue.updateMany(
    {},
    { $unset: { subTypes: 1 } },
  );
  logger.info('Finish removing subTypes from QueryBuilderCacheValue');
};

/**
 * @param {object} qbcv - query builder cache value
 * @return {string[]} subTypes
 */
const buildSubTypes = (qbcv) => {
  const objectType = _.get(qbcv, ['value', 'objectType']);

  switch (objectType) {
    case 'Agent': return [SUBTYPE_AGENT];
    case 'Verb': return [SUBTYPE_VERB];
    case 'Activity':
      const definitionType = _.get(qbcv, ['value', 'definition', 'type']);
      if (definitionType) {
        return [definitionType, SUBTYPE_ACTIVITY];
      }
      return [SUBTYPE_ACTIVITY];
    default: return [];
  }
}

const addSubTypesToQBCV = async () => {
  logger.info('Start adding subTypes to QueryBuilderCacheValue');

  const qbcvs = await QueryBuilderCacheValue.find({});
  for (const qbcv of qbcvs) {
    qbcv.subTypes = buildSubTypes(qbcv);
    await qbcv.save();
  }

  logger.info('Finish adding subTypes to QueryBuilderCacheValue');
};

export default addSubTypesToQBCV;
