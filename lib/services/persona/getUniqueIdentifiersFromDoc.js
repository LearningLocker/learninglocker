import _ from 'lodash';
import PersonaFinder from 'lib/classes/PersonaFinder';
import { STATEMENT_ACTOR_MBOX,
         STATEMENT_ACTOR_ACCOUNT,
         STATEMENT_ACTOR_OPENID } from 'lib/constants/statements';

export default (doc, matchedIndexes, next) => {
  try {
    const personaFinder = new PersonaFinder();
    const identifiers = [];
    let personEmail = '';
    let personUserName = '';
    let personHomePage = '';
    let personAccount = '';
    let personOpenId = '';

    _.map(doc, (line, index) => {
      if (line && line.length > 0) {
        if (index === matchedIndexes.usernameIndex) personUserName = line;
        if (index === matchedIndexes.homePageIndex) personHomePage = line;
        if (index === matchedIndexes.emailIndex) personEmail = `mailto:${line}`;
        if (index === matchedIndexes.openIdIndex) personOpenId = line;
      }
    });

    if (personUserName !== '' && personHomePage !== '') {
      personAccount = {
        name: personUserName,
        homePage: personHomePage
      };
    }

    if (personEmail !== '') identifiers.push(personaFinder.makeIdent(STATEMENT_ACTOR_MBOX, personEmail));
    if (personAccount !== '') identifiers.push(personaFinder.makeIdent(STATEMENT_ACTOR_ACCOUNT, personAccount));
    if (personOpenId !== '') identifiers.push(personaFinder.makeIdent(STATEMENT_ACTOR_OPENID, personOpenId));
    return next(null, identifiers);
  } catch (err) {
    return next(err);
  }
};
