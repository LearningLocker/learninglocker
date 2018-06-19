export default (model) => {
  return {
    organisation: model.get('organisation'),
    owner: model.get('owner'),
    description: model.get('description'),
    isPublic: model.get('isPublic'),
    type: model.get('type'),
    config: {
      previewPeriod: model.get('previewPeriod'),
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
      firstValue: {
        label: model.getIn(['axesxValue', 'searchString']),
        key: model.getIn(['axesxValue', 'optionKey']),
        operator: model.get('axesxOperator'),
        filter: model.get('axesxQuery'),
      },
      secondValue: {
        label: model.getIn(['axesyValue', 'searchString']),
        key: model.getIn(['axesyValue', 'optionKey']),
        operator: model.get('axesyOperator'),
        filter: model.get('axesyQuery'),
      },
    },
    createdAt: model.get('createdAt'),
    updatedAt: model.get('updatedAt'),
    _id: model.get('_id'),
  };
};
