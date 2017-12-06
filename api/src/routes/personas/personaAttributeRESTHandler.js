import * as routes from 'lib/constants/routes';
import express from 'express';
import passport from 'api/auth/passport';
import { DEFAULT_PASSPORT_OPTIONS } from 'lib/constants/auth';
import PersonaAttributeController from 'api/controllers/PersonaAttributeController';

const router = new express.Router();

router.get(
  routes.PERSONA_ATTRIBUTE_COUNT,
  passport.authenticate(['jwt', 'client_basic'], DEFAULT_PASSPORT_OPTIONS),
  PersonaAttributeController.personaAttributeCount
);
router.get(
  routes.PERSONA_ATTRIBUTE,
  passport.authenticate(['jwt', 'client_basic'], DEFAULT_PASSPORT_OPTIONS),
  PersonaAttributeController.getPersonaAttributes
);
router.get(
  routes.PERSONA_ATTRIBUTE_ID,
  passport.authenticate(['jwt', 'client_basic'], DEFAULT_PASSPORT_OPTIONS),
  PersonaAttributeController.getPersonaAttribute
);
router.post(
  routes.PERSONA_ATTRIBUTE,
  passport.authenticate(['jwt', 'client_basic'], DEFAULT_PASSPORT_OPTIONS),
  PersonaAttributeController.addPersonaAttribute
);
router.post(
  routes.PERSONA_ATTRIBUTE_ID,
  passport.authenticate(['jwt', 'client_basic'], DEFAULT_PASSPORT_OPTIONS),
  PersonaAttributeController.updatePersonaAttribute
);
router.put(
  routes.PERSONA_ATTRIBUTE,
  passport.authenticate(['jwt', 'client_basic'], DEFAULT_PASSPORT_OPTIONS),
  PersonaAttributeController.addPersonaAttribute
);
router.put(
  routes.PERSONA_ATTRIBUTE_ID,
  passport.authenticate(['jwt', 'client_basic'], DEFAULT_PASSPORT_OPTIONS),
  PersonaAttributeController.updatePersonaAttribute
);
router.patch(
  routes.PERSONA_ATTRIBUTE_ID,
  passport.authenticate(['jwt', 'client_basic'], DEFAULT_PASSPORT_OPTIONS),
  PersonaAttributeController.updatePersonaAttribute
);
router.delete(
  routes.PERSONA_ATTRIBUTE_ID,
  passport.authenticate(['jwt', 'client_basic'], DEFAULT_PASSPORT_OPTIONS),
  PersonaAttributeController.deletePersonaAttribute
);
router.get(
  routes.CONNECTION_PERSONA_ATTRIBUTE,
  passport.authenticate(['jwt', 'client_basic'], DEFAULT_PASSPORT_OPTIONS),
  PersonaAttributeController.personaAttributeConnection
);

export default router;
