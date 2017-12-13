import { isArray, map } from 'lodash';
import Promise from 'bluebird';
import wrapHandlerForStatement from 'worker/handlers/statement/wrapHandlerForStatement';
import { STATEMENT_EXTRACT_PERSONAS_QUEUE } from 'lib/constants/statements';
import asignIdentifierToStatements from 'lib/services/persona/asignIdentifierToStatements';
import getIfiFromActor from 'lib/services/persona/libs/getIfiFromActor';

const handleStatement = personaService => async (statement) => {
  const ifi = getIfiFromActor(statement.statement.actor);

  const {
    personaId,
    identifierId,
    wasCreated,
  } = await personaService.createUpdateIdentifierPersona({
    organisation: statement.organisation,
    ifi,
    personaName: statement.statement.actor.name,
  });

  const { persona } = await personaService.getPersona({
    organisation: statement.organisation,
    personaId
  });

  if (!wasCreated) {
    statement.personaIdentifier = identifierId;
    statement.person = {
      _id: personaId,
      display: persona.name
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
