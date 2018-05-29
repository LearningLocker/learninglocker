export default (ifi) => {
  const { key, value } = ifi;
  const statementPrefix = 'statement.actor';

  if (
    key === 'mbox' ||
    key === 'mbox_sha1sum' ||
    key === 'openid'
  ) {
    return {
      [`${statementPrefix}.${key}`]: value
    };
  }

  if (key === 'account') {
    if (!value.homePage || !value.name) {
      throw new Error('Malformed personaIdentifier ifi (missing all account details)');
    }

    return {
      [`${statementPrefix}.account.homePage`]: value.homePage,
      [`${statementPrefix}.account.name`]: value.name,
    };
  }

  throw new Error(`Unrecognised personaIdentifier ifi key '${key}'`);
};
