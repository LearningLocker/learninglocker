import { isArray, map } from 'lodash';
import Promise from 'bluebird';
import logger from 'lib/logger';
import wrapHandlerForStatement from 'worker/handlers/statement/wrapHandlerForStatement';
import { STATEMENT_EXTRACT_PERSONAS_QUEUE, getIfiDisplayName } from 'lib/constants/statements';
import asignIdentifierToStatements from 'lib/services/persona/asignIdentifierToStatements';
import getIfiFromActor from 'lib/services/persona/utils/getIfiFromActor';

const handleStatement = personaService => async (statement) => {
  const ifi = getIfiFromActor(statement.statement.actor);

  // This will only apply to the persona if they are created
  const personaName = statement.statement.actor.name
    ? statement.statement.actor.name
    : getIfiDisplayName(ifi);

  const {
    personaId,
    identifierId,
    wasCreated,
  } = await personaService.createUpdateIdentifierPersona({
    organisation: statement.organisation,
    ifi,
    personaName,
  });

  let display = 'Unknown name';
  try {
    const { persona } = await personaService.getPersona({
      organisation: statement.organisation,
      personaId
    });
    if (persona) {
      display = persona.name;
    }
  } catch (err) {
    logger.error('Error finding person - not updating statement', err);
  }

  if (!wasCreated) {
    statement.personaIdentifier = identifierId;
    statement.person = {
      _id: personaId,
      display,
    };
    await statement.save();
  } else {
    await asignIdentifierToStatements({ organisation: statement.organisation.toString(), toIdentifierId: identifierId });
  }
};

const handleStatements = personaService => (statements) => {
  if (isArray(statements)) {
    const handleStatementWithPersonaService = handleStatement(personaService);
    return Promise.all(map(statements, handleStatementWithPersonaService));
  }
  return handleStatement(personaService)(statements);
};

export const extractPersonasStatementHandler = personaService =>
  (statements, done) =>
    handleStatements(personaService)(statements)
      .then(() => { done(null); })
      .catch(done);

// PROCESS START
export default personaService => wrapHandlerForStatement(
  STATEMENT_EXTRACT_PERSONAS_QUEUE,
  extractPersonasStatementHandler(personaService)
);
