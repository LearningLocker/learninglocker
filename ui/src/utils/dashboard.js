import getRouteUrl from 'ui/utils/getRouteUrl';
import {
  JWT_SECURED,
  ANY
} from 'lib/constants/dashboard';
import jwt from 'jsonwebtoken';
import { isUndefined } from 'lodash';

export const getShareableUrl = ({ // eslint-disable-line import/prefer-default-export
  model,
  parentModel
}) => {
  const title = model.get('title', '')
    .replace(/\s/g, '-')
    .replace(/~-/g, '~');
  const urlEncodedTitle = encodeURI(title);

  if (model.get('filterMode') === ANY) {
    return `${getRouteUrl()}/dashboards/${parentModel.get('_id')}/${model.get('_id')}/${urlEncodedTitle}?filter={}`;
  }

  if (model.get('filterMode') !== JWT_SECURED || isUndefined(model.get('filterJwtSecret')) || model.get('filterJwtSecret') === '') {
    return `${getRouteUrl()}/dashboards/${parentModel.get('_id')}/${model.get('_id')}/${urlEncodedTitle}`;
  }

  const jwtToken = jwt.sign({}, model.get('filterJwtSecret'), { noTimestamp: true });
  return `${getRouteUrl()}/dashboards/${parentModel.get('_id')}/${model.get('_id')}/${urlEncodedTitle}?filter=${jwtToken}`;
};
