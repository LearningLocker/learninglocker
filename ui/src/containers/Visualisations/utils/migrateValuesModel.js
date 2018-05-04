export default (model) => {
  return {
    organisation: model.get('organisation'),
    owner: model.get('owner'),
    description: model.get('description'),
    isPublic: model.get('isPublic'),
    type: model.get('type'),
    config: {
      previewPeriod: model.get('previewPeriod'),
      stacked: model.get('stacked'),
      series: model.get('filters').map((series, seriesIndex) => {
        return {
          label: series.get('label', `Series ${seriesIndex}`),
          colour: series.get('color', 'orange'),
          filter: series.get('filter'),
        };
      }).toJS(),
      group: {
        label: model.getIn(['axesgroup', 'searchString']),
        key: model.getIn(['axesgroup', 'optionKey']),
      },
      value: {
        label: model.getIn(['axesvalue', 'searchString']),
        key: model.getIn(['axesvalue', 'optionKey']),
        operator: model.get('axesoperator'),
      },
    },
    createdAt: model.get('createdAt'),
    updatedAt: model.get('updatedAt'),
    _id: model.get('_id'),
  };
};
