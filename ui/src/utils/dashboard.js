import getRouteUrl from 'ui/utils/getRouteUrl';
import { JWT_SECURED } from 'lib/constants/dashboard';
import jwt from 'jsonwebtoken';

export const getShareableUrl = ({ // eslint-disable-line import/prefer-default-export
  model,
  parentModel
}) => {
  const title = model.get('title', '')
    .replace(/\s/g, '-')
    .replace(/~-/g, '~');
  const urlEndocedTitle = encodeURI(title);

  if (model.get('filterMode') !== JWT_SECURED) {
    return `${getRouteUrl()}/dashboards/${parentModel.get('_id')}/${model.get('_id')}/${urlEndocedTitle}`;
  }

  const jwtToken = jwt.sign({}, model.get('filterJwtSecret'));
  return `${getRouteUrl()}/dashboards/${parentModel.get('_id')}/${model.get('_id')}/${urlEndocedTitle}?filter=${jwtToken}`;
};
