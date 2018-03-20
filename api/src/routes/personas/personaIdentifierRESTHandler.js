import * as routes from 'lib/constants/routes';
import express from 'express';
import passport from 'api/auth/passport';
import { DEFAULT_PASSPORT_OPTIONS } from 'lib/constants/auth';
import PersonaIdentifierController from 'api/controllers/PersonaIdentifierController';

const router = new express.Router();

router.get(
  routes.PERSONA_IDENTIFIER_COUNT,
  passport.authenticate(['jwt', 'clientBasic'], DEFAULT_PASSPORT_OPTIONS),
  PersonaIdentifierController.personaIdentifierCount
);
router.get(
  routes.PERSONA_IDENTIFIER,
  passport.authenticate(['jwt', 'clientBasic'], DEFAULT_PASSPORT_OPTIONS),
  PersonaIdentifierController.getPersonaIdentifiers
);
router.get(
  routes.PERSONA_IDENTIFIER_ID,
  passport.authenticate(['jwt', 'clientBasic'], DEFAULT_PASSPORT_OPTIONS),
  PersonaIdentifierController.getPersonaIdentifier
);
router.post(
  routes.PERSONA_IDENTIFIER,
  passport.authenticate(['jwt', 'clientBasic'], DEFAULT_PASSPORT_OPTIONS),
  PersonaIdentifierController.addPersonaIdentifier
);
router.post(
  routes.PERSONA_IDENTIFIER_UPSERT,
  passport.authenticate(['jwt', 'clientBasic'], DEFAULT_PASSPORT_OPTIONS),
  PersonaIdentifierController.upsertPersonaIdentifier
);
router.post(
  routes.PERSONA_IDENTIFIER_ID,
  passport.authenticate(['jwt', 'clientBasic'], DEFAULT_PASSPORT_OPTIONS),
  PersonaIdentifierController.updatePersonaIdentifier
);
router.put(
  routes.PERSONA_IDENTIFIER,
  passport.authenticate(['jwt', 'clientBasic'], DEFAULT_PASSPORT_OPTIONS),
  PersonaIdentifierController.addPersonaIdentifier
);
router.put(
  routes.PERSONA_IDENTIFIER_ID,
  passport.authenticate(['jwt', 'clientBasic'], DEFAULT_PASSPORT_OPTIONS),
  PersonaIdentifierController.updatePersonaIdentifier
);
router.patch(
  routes.PERSONA_IDENTIFIER_ID,
  passport.authenticate(['jwt', 'clientBasic'], DEFAULT_PASSPORT_OPTIONS),
  PersonaIdentifierController.updatePersonaIdentifier
);
router.delete(
  routes.PERSONA_IDENTIFIER_ID,
  passport.authenticate(['jwt', 'clientBasic'], DEFAULT_PASSPORT_OPTIONS),
  PersonaIdentifierController.deletePersonaIdentifier
);
router.get(
  routes.CONNECTION_PERSONA_IDENTIFIER,
  passport.authenticate(['jwt', 'clientBasic'], DEFAULT_PASSPORT_OPTIONS),
  PersonaIdentifierController.personaIdentifierConnection
);

export default router;
