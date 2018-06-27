export default (actor) => {
  if (actor.mbox) {
    return { key: 'mbox', value: actor.mbox };
  }

  if (actor.mbox_sha1sum) {
    return { key: 'mbox_sha1sum', value: actor.mbox_sha1sum };
  }

  if (actor.openid) {
    return {
      key: 'openid',
      value: actor.openid
    };
  }

  if (actor.account) {
    return {
      key: 'account',
      value: {
        homePage: actor.account.homePage,
        name: actor.account.name,
      }
    };
  }

  throw new Error('Actor does not have a valid ident key');
};
