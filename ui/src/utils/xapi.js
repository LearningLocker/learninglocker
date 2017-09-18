import { Map, Set, Iterable } from 'immutable';
import { has, isString } from 'lodash';

export const strDisplay = (value) => {
  if (isString(value)) {
    return value;
  }
  return has(value, 'toString') ? value.toString() : JSON.stringify(value);
};

export const displayActor = (actor = new Map()) => {
  if (Iterable.isIterable(actor)) {
    if (actor.has('name')) return actor.get('name');
    if (actor.has('mbox')) return actor.get('mbox');
    if (actor.has('openid')) return actor.get('openid');
    if (actor.has('mbox_sha1sum')) return actor.get('mbox_sha1sum');
    if (actor.hasIn(['account', 'name'])) return actor.getIn(['account', 'name']);
    if (actor.has('member')) {
      return `Anonymous group of ${actor.get('member').size} members`;
    }
    return 'Anonymous actor';
  }
  return actor;
};

const actorIdents = new Set(['mbox', 'mbox_sha1sum', 'openid', 'account']);
export const getActorIdentifiers = (actor = new Map()) =>
  actor.filter((value, key) => actorIdents.has(key));

export const displayLangMap = (langMap = new Map(), defaultDisplay = '') => {
  const langs = (navigator && navigator.languages) || [];
  const displays = langs
    .map(lang => langMap.get(lang))
    .filter(value => !!value);
  const display = displays[0] || langMap.first();
  return display || defaultDisplay;
};

export const displayVerb = (verb = new Map()) =>
  displayLangMap(verb.get('display', new Map()), verb.get('id'));

export const displayActivity = (activity = new Map()) => {
  if (Iterable.isIterable(activity)) {
    const objectType = activity.get('objectType', 'Activity');
    if (objectType === 'Activity') {
      const name = activity.getIn(['definition', 'name'], new Map());
      return displayLangMap(name, activity.get('id', ''));
    }

    if (objectType === 'Group' || objectType === 'Agent') {
      return displayActor(activity);
    }
  }
  return activity;
};

export const actorIdentToString = (actor = new Map()) => {
  if (Iterable.isIterable(actor)) {
    if (actor.has('mbox')) return `Mbox: ${actor.get('mbox')}`;
    if (actor.has('account')) return `Account: (${actor.get('account').valueSeq().toJS().join(', ')})`;
    if (actor.has('mbox_sha1sum')) return `Mbox Sha1sum: ${actor.get('mbox_sha1sum')}`;
    if (actor.has('openid')) return `OpenID: ${actor.get('openid')}`;
    return JSON.stringify(actor.toJS());
  }
  return actor;
};


export const identToString = (obj = new Map()) => {
  if (Iterable.isIterable(obj)) {
    if (obj.has('id')) return `ID: ${obj.get('id')}`;
    return JSON.stringify(obj.toJS());
  }

  return obj;
};

export const objectIdentToString = (obj = new Map()) => {
  if (Iterable.isIterable(obj)) {
    const objectType = obj.get('objectType', 'Activity');
    switch (objectType) {
      default:
      case 'Activity':
        return identToString(obj);
      case 'Agent':
      case 'Group':
        return `${actorIdentToString(obj)} (${objectType})`;
      case 'SubStatement':
        return `${objectType}(${JSON.stringify(obj.toJS())})`;
      case 'StatementRef':
        return `${identToString(obj)} (${objectType})`;
    }
  }
  return obj;
};

export const displayDefinition = (obj = new Map()) => {
  if (Iterable.isIterable(obj)) {
    if (obj.has('name')) return displayLangMap(obj.get('name'));
    if (obj.has('description')) return displayLangMap(obj.get('description'));
    if (obj.has('description')) return displayLangMap(obj.get('description'));
  }
  return obj;
};
