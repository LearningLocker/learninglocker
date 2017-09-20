import testId from 'api/routes/tests/utils/testId';
import PersonaIdentifier from 'lib/models/personaidentifier';
import {
  STATEMENT_ACTOR_MBOX,
  STATEMENT_ACTOR_NAME
} from 'lib/constants/statements';

export default (
  personaId = null,
  mbox = 'mailto:test@example.com',
  name = 'John Doe',
  personaScores = []
) =>
  PersonaIdentifier.create({
    organisation: testId,
    persona: personaId,
    personaScores,
    uniqueIdentifier: {
      key: STATEMENT_ACTOR_MBOX,
      value: mbox
    },
    identifiers: [
      { key: STATEMENT_ACTOR_MBOX, value: mbox },
      { key: STATEMENT_ACTOR_NAME, value: name }
    ],
    statements: []
  });
