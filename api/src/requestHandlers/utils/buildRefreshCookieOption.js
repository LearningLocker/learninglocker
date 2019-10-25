import ms from 'ms';

export function buildRefreshCookieOption(protocol) {
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
};
