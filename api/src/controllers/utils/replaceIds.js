export const replaceId = ({ id, ...model }) => {
  return { _id: id, ...model };
};

export const replaceIds = (models) => {
  models.map(replaceId);
};
