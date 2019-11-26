import ms from 'ms';
import { JWT_REFRESH_TOKEN_EXPIRATION } from 'lib/constants/auth';
import { AUTH_JWT_REFRESH } from 'lib/constants/routes';

export default function buildRefreshCookieOption(protocol) {
  const validPeriodMsec = ms(JWT_REFRESH_TOKEN_EXPIRATION);

  const cookieOption = {
    path: `/api${AUTH_JWT_REFRESH}`,
    expires: new Date(Date.now() + validPeriodMsec),
    maxAge: validPeriodMsec,
    httpOnly: true,
    sameSite: 'Strict',
  };

  if (protocol === 'https') {
    return { ...cookieOption, secure: true };
  }
  return cookieOption;
}
