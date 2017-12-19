import _ from 'lodash';
import { getConnection } from 'lib/connections/mongoose';

/**
 * Converts the value of the operator to the correct query.
 * From {key: 'statement.actor.mbox', value: 'mailto:test@example.com'}
 * To {$in: [ObjectId('123')]}
 * @param {any} identifier
 * @return {any}
 */
const convertOpValue = (identifier) => {
  const PersonaIdentifier = getConnection().model('PersonaIdentifier');

  const { key, value } = identifier;
  const query = {
    identifiers: {
      $elemMatch: { key, value }
    },
    persona: { $exists: true }
  };

  return PersonaIdentifier.find(query).select({ persona: 1 }).lean().exec()
    .then((personaIdentifiers) => {
      const ids = _.without(personaIdentifiers.map(
        personaIdentifier => personaIdentifier.persona
      ), undefined, null);
      return { $in: ids };
    });
};

const convert$personaIdent = (value) => {
  const op = '$personaIdent';
  if (_.has(value, op)) {
    return convertOpValue(_.get(value, op));
  } else if (_.isArray(value)) {
    return Promise.all(value.map(convert$personaIdent));
  } else if (_.isPlainObject(value)) {
    return Promise.all(_.map(value, (child, key) =>
       convert$personaIdent(child).then(convertedValue =>
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
