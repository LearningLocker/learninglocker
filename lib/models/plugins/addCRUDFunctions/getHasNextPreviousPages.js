import { FORWARDS, BACKWARDS } from 'lib/constants/addCRUDFunctions';

const getHasNextPages = ({
  models,
  limit,
  direction,
  cursor
}) => {
  const ifGoingBackwardsAndHasCursor = (direction === BACKWARDS && cursor !== undefined);
  const ifGoingForwardAndHasMoreModels = direction === FORWARDS && models.length > limit;

  return (ifGoingBackwardsAndHasCursor || ifGoingForwardAndHasMoreModels);
};

const getHasPreviousPages = ({
  models,
  limit,
  direction,
  cursor
}) => {
  const ifGoingForwardsAndHasCursor = (direction === FORWARDS && cursor !== undefined);
  const ifGoingBackwardsAndHasMoreModels = direction === BACKWARDS && models.length > limit;

  return (ifGoingForwardsAndHasCursor || ifGoingBackwardsAndHasMoreModels);
};

export { getHasNextPages, getHasPreviousPages };
