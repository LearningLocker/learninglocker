import url from 'url';
import _ from 'lodash';
import { AUTH_JWT_GOOGLE } from 'lib/constants/routes';

const settings = 'scrollbars=no,toolbar=no,location=no,titlebar=no,directories=no,status=no,menubar=no';

function getPopupOffset({ width, height }) {
  const wLeft = window.screenLeft ? window.screenLeft : window.screenX;
  const wTop = window.screenTop ? window.screenTop : window.screenY;

  const left = (wLeft + (window.innerWidth / 2)) - (width / 2);
  const top = (wTop + (window.innerHeight / 2)) - (height / 2);

  return { top, left };
}

function getPopupSize(provider) {
  switch (provider) {
    case 'facebook':
      return { width: 580, height: 400 };

    case 'google':
      return { width: 452, height: 633 };

    case 'github':
      return { width: 1020, height: 618 };

    case 'linkedin':
      return { width: 527, height: 582 };

    case 'twitter':
      return { width: 495, height: 645 };

    case 'live':
      return { width: 500, height: 560 };

    case 'yahoo':
      return { width: 559, height: 519 };

    default:
      return { width: 1020, height: 618 };
  }
}

function getPopupDimensions(provider) {
  const { width, height } = getPopupSize(provider);
  const { top, left } = getPopupOffset({ width, height });

  return `width=${width},height=${height},top=${top},left=${left}`;
}

function getEndpoint(provider) {
  switch (provider) {
    case 'facebook':
      return '';

    case 'google':
      return `/api${AUTH_JWT_GOOGLE}`;

    case 'github':
      return '';

    case 'linkedin':
      return '';

    case 'twitter':
      return '';

    case 'live':
      return '';

    case 'yahoo':
      return '';

    default:
      return '';
  }
}

export function openPopup(provider) {
  return window.open(getEndpoint(provider), provider, `${settings},${getPopupDimensions(provider)}`);
}

function checkForToken(popup, resolve, reject) {
  if (popup.closed) reject({ errors: 'Authentication was cancelled.' });
  else {
    let parsed;
    try {
      parsed = url.parse(popup.location.href, true);
    } catch (e) {
      // cross origin errors will be thrown trying to
      // access the popup when it is on the third party site
    }

    if (_.has(parsed, 'query.access_token')) {
      popup.close();
      resolve(_.get(parsed, 'query.access_token'));
    } else setTimeout(checkForToken.bind(null, popup, resolve, reject), 0);
  }
}

export function listenForToken(popup) {
  return new Promise((resolve, reject) => {
    checkForToken(popup, resolve, reject);
  });
}
