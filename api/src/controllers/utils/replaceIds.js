export const replaceId = ({ id, ...model }) => ({ _id: id, ...model });

export const replaceIds = models => models.map(replaceId);

