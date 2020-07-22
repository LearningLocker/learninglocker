import _, { map, without } from 'lodash';
import getService from 'lib/connections/personaService';
import logger from 'lib/logger';
import { MAX_TIME_MS } from 'lib/models/plugins/addCRUDFunctions';
import getOrgFromAuthInfo from 'lib/services/auth/authInfoSelectors/getOrgFromAuthInfo';

/**
 * Converts the value of the operator to the correct query.
 * From {key: 'statement.actor.mbox', value: 'mailto:test@example.com'}
 * To {$in: [ObjectId('123')]}
 * @param {any} identifier
 * @return {any}
 */
const convertOpValue = async (identifier, {
  authInfo
} = {}) => {
  const organisation = getOrgFromAuthInfo(authInfo);
  const personaService = getService();

  const filter = {
    key: identifier.key.replace('persona.import.', ''),
    value: identifier.value
  };

  // todo, check when actually exsits.
  let attributes;
  try {
    // TODO: change to use non connection api.
    const result = await personaService.getAttributes({
      filter,
      organisation,
      limit: Number.MAX_SAFE_INTEGER,
      maxTimeMS: MAX_TIME_MS
    });
    attributes = map(result.edges, ({ node }) => node);
  } catch (err) {
    logger.error('convert$personaIdent', err);
    return;
  }

  return { $in: without(map(attributes, ({ personaId }) => personaId), undefined, null) };
};

const convert$personaIdent = (value, options) => {
  const op = '$personaIdent';
  if (_.has(value, op)) {
    return convertOpValue(_.get(value, op), options);
  } else if (_.isArray(value)) {
    return Promise.all(value.map(item => convert$personaIdent(item, options)));
  } else if (_.isPlainObject(value)) {
    return Promise.all(_.map(value, (child, key) =>
      convert$personaIdent(child, options).then(convertedValue =>
        ({ [key]: convertedValue })
      )
    )).then((parts) => {
      const result = Object.assign({}, ...parts);
      return result;
    });
  }
  return Promise.resolve(value);
};

export default convert$personaIdent;
