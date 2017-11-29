import * as routes from 'lib/constants/routes';
import express from 'express';
import passport from 'api/auth/passport';
import { DEFAULT_PASSPORT_OPTIONS } from 'lib/constants/auth';
import PersonaController from 'api/controllers/PersonaController';

const router = new express.Router();

router.get(
  routes.PERSONA_ATTRIBUTE_COUNT,
  passport.authenticate(['jwt', 'client_basic'], DEFAULT_PASSPORT_OPTIONS),
  PersonaController.personaAttributeCount
);
router.get(
  routes.PERSONA_ATTRIBUTE,
  passport.authenticate(['jwt', 'client_basic'], DEFAULT_PASSPORT_OPTIONS),
  PersonaController.getPersonaAttributes
);
router.get(
  routes.PERSONA_ATTRIBUTE_ID,
  passport.authenticate(['jwt', 'client_basic'], DEFAULT_PASSPORT_OPTIONS),
  PersonaController.getPersonaAttribute
);
router.post(
  routes.PERSONA_ATTRIBUTE,
  passport.authenticate(['jwt', 'client_basic'], DEFAULT_PASSPORT_OPTIONS),
  PersonaController.addPersonaAttribute
);
router.post(
  routes.PERSONA_ATTRIBUTE_ID,
  passport.authenticate(['jwt', 'client_basic'], DEFAULT_PASSPORT_OPTIONS),
  PersonaController.updatePersonaAttribute
);
router.put(
  routes.PERSONA_ATTRIBUTE,
  passport.authenticate(['jwt', 'client_basic'], DEFAULT_PASSPORT_OPTIONS),
  PersonaController.addPersonaAttribute
);
router.put(
  routes.PERSONA_ATTRIBUTE_ID,
  passport.authenticate(['jwt', 'client_basic'], DEFAULT_PASSPORT_OPTIONS),
  PersonaController.updatePersonaAttribute
);
router.patch(
  routes.PERSONA_ATTRIBUTE_ID,
  passport.authenticate(['jwt', 'client_basic'], DEFAULT_PASSPORT_OPTIONS),
  PersonaController.updatePersonaAttribute
);
router.delete(
  routes.PERSONA_ATTRIBUTE_ID,
  passport.authenticate(['jwt', 'client_basic'], DEFAULT_PASSPORT_OPTIONS),
  PersonaController.deletePersonaAttribute
);
router.get(
  routes.CONNECTION_PERSONA_ATTRIBUTE,
  passport.authenticate(['jwt', 'client_basic'], DEFAULT_PASSPORT_OPTIONS),
  PersonaController.personaAttributeConnection
);

export default router;
