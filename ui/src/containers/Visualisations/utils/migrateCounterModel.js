export default (model) => {
  return {
    organisation: model.get('organisation'),
    owner: model.get('owner'),
    description: model.get('description'),
    isPublic: model.get('isPublic'),
    type: model.get('type'),
    config: {
      previewPeriod: model.get('previewPeriod'),
      filter: model.getIn(['filters', 0]),
      value: {
        key: model.getIn(['axesvalue', 'optionKey']),
        operator: model.get('axesoperator'),
        colour: 'red',
      },
    },
    createdAt: model.get('createdAt'),
    updatedAt: model.get('updatedAt'),
    _id: model.get('_id'),
  };
};
