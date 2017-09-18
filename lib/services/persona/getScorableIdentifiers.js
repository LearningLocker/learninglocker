import _ from 'lodash';
import { STATEMENT_ACTOR_NAME, STATEMENT_ACTOR_ACCOUNT_NAME } from 'lib/constants/statements';
import mollusc from 'mollusc';

const CSV_FIELD_PREFIX = 'persona.import.';

export default (foundIdents, doc, organisation, matchedIndexes, customIndexes) => {
  const jsonIdents = {};
  // assign all the found idents values into the object
  _.each(foundIdents, (ident) => {
    if (!_.has(jsonIdents, ident.key)) {
      jsonIdents[ident.key] = ident.value;
    }
  });

  // go fish out some other bits and pieces
  let personFirstName = '';
  let personLastName = '';
  let personName = '';
  let personUserName = '';

  if (!doc) return jsonIdents;
  _.map(doc, (line, index) => {
    if (index === matchedIndexes.usernameIndex) personUserName = line;
    if (index === matchedIndexes.firstnameIndex) personFirstName = line;
    if (index === matchedIndexes.lastnameIndex) personLastName = line;
    if (index === matchedIndexes.nameIndex) personName = line;
  });

  if (personFirstName !== '' && personLastName !== '') {
    jsonIdents[STATEMENT_ACTOR_NAME] = `${personFirstName} ${personLastName}`;
  } else if (personName !== '') {
    jsonIdents[STATEMENT_ACTOR_NAME] = personName;
  }
  if (personUserName !== '') jsonIdents[STATEMENT_ACTOR_ACCOUNT_NAME] = personUserName;

  _.forEach(customIndexes, (customIdent) => {
    const identKey = CSV_FIELD_PREFIX.concat(mollusc(customIdent.fieldName));
    if (!jsonIdents[identKey] && doc[customIdent.index]) {
      jsonIdents[identKey] = doc[customIdent.index];
    }
  });

  return jsonIdents;
};
