import { replaceId, replaceIds } from './replaceIds';

export const entityResponse = (res, entity) => res.status(200).send(replaceId(entity));

export const entitiesResponse = (res, entities) => res.status(200).send(replaceIds(entities));
