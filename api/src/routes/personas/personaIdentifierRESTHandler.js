import * as routes from 'lib/constants/routes';
import express from 'express';
import passport from 'api/auth/passport';
import { DEFAULT_PASSPORT_OPTIONS } from 'lib/constants/auth';
import PersonaController from 'api/controllers/PersonaController';

const router = new express.Router();

router.get(
  routes.PERSONA_IDENTIFIER,
  passport.authenticate(['jwt', 'client_basic'], DEFAULT_PASSPORT_OPTIONS),
  PersonaController.getPersonaIdentifier
);
router.get(
  routes.PERSONA_IDENTIFIER_ID,
  passport.authenticate(['jwt', 'client_basic'], DEFAULT_PASSPORT_OPTIONS),
  PersonaController.getPersonaIdentifier
);
router.post(
  routes.PERSONA_IDENTIFIER,
  passport.authenticate(['jwt', 'client_basic'], DEFAULT_PASSPORT_OPTIONS),
  PersonaController.addPersonaIdentifier
);
router.post(
  routes.PERSONA_IDENTIFIER_ID,
  passport.authenticate(['jwt', 'client_basic'], DEFAULT_PASSPORT_OPTIONS),
  PersonaController.updatePersonaIdentifier
);
router.put(
  routes.PERSONA_IDENTIFIER,
  passport.authenticate(['jwt', 'client_basic'], DEFAULT_PASSPORT_OPTIONS),
  PersonaController.addPersonaIdentifier
);
router.put(
  routes.PERSONA_IDENTIFIER_ID,
  passport.authenticate(['jwt', 'client_basic'], DEFAULT_PASSPORT_OPTIONS),
  PersonaController.updatePersonaIdentifier
);
router.patch(
  routes.PERSONA_IDENTIFIER_ID,
  passport.authenticate(['jwt', 'client_basic'], DEFAULT_PASSPORT_OPTIONS),
  PersonaController.updatePersonaIdentifier
);
router.delete(
  routes.PERSONA_IDENTIFIER_ID,
  passport.authenticate(['jwt', 'client_basic'], DEFAULT_PASSPORT_OPTIONS),
  PersonaController.deletePersonaIdentifier
);
router.get(
  routes.PERSONA_IDENTIFIER_COUNT,
  passport.authenticate(['jwt', 'client_basic'], DEFAULT_PASSPORT_OPTIONS),
  PersonaController.personaIdentifierCount
);
router.get(
  routes.CONNECTION_PERSONA_IDENTIFIER,
  passport.authenticate(['jwt', 'client_basic'], DEFAULT_PASSPORT_OPTIONS),
  PersonaController.personaIdentifierConnection
);

export default router;
