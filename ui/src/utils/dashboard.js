import getRouteUrl from 'ui/utils/getRouteUrl';

export const getShareableUrl = ({ // eslint-disable-line import/prefer-default-export
  model,
  parentModel
}) => {
  const title = model.get('title', '')
    .replace(/\s/g, '-')
    .replace(/~-/g, '~');
  const urlEndocedTitle = encodeURI(title);

  return `${getRouteUrl()}/dashboards/${parentModel.get('_id')}/${model.get('_id')}/${urlEndocedTitle}`;
};
