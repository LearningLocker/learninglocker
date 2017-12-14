import { replaceId, replaceIds } from './replaceIds';

export const entityResponse = (res, entity) => {
  return res.status(200).send(replaceId(entity));
};

export const entitiesResponse = (res, entities) => {
  return res.status(200).send(replaceIds(entities));
};
