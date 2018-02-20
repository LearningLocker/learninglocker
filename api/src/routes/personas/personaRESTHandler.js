import * as routes from 'lib/constants/routes';
import express from 'express';
import passport from 'api/auth/passport';
import { DEFAULT_PASSPORT_OPTIONS } from 'lib/constants/auth';
import PersonaController from 'api/controllers/PersonaController';

const router = new express.Router();

router.get(
  routes.PERSONA_COUNT,
  passport.authenticate(['jwt', 'clientBasic'], DEFAULT_PASSPORT_OPTIONS),
  PersonaController.personaCount
);
router.get(
  routes.PERSONA,
  passport.authenticate(['jwt', 'clientBasic'], DEFAULT_PASSPORT_OPTIONS),
  PersonaController.getPersonas
);
router.get(
  routes.PERSONA_ID,
  passport.authenticate(['jwt', 'clientBasic'], DEFAULT_PASSPORT_OPTIONS),
  PersonaController.getPersona
);
router.post(
  routes.PERSONA,
  passport.authenticate(['jwt', 'clientBasic'], DEFAULT_PASSPORT_OPTIONS),
  PersonaController.addPersona
);
router.post(
  routes.PERSONA_ID,
  passport.authenticate(['jwt', 'clientBasic'], DEFAULT_PASSPORT_OPTIONS),
  PersonaController.updatePersona
);
router.put(
  routes.PERSONA,
  passport.authenticate(['jwt', 'clientBasic'], DEFAULT_PASSPORT_OPTIONS),
  PersonaController.addPersona
);
router.put(
  routes.PERSONA_ID,
  passport.authenticate(['jwt', 'clientBasic'], DEFAULT_PASSPORT_OPTIONS),
  PersonaController.updatePersona
);
router.patch(
  routes.PERSONA_ID,
  passport.authenticate(['jwt', 'clientBasic'], DEFAULT_PASSPORT_OPTIONS),
  PersonaController.updatePersona
);
router.delete(
  routes.PERSONA_ID,
  passport.authenticate(['jwt', 'clientBasic'], DEFAULT_PASSPORT_OPTIONS),
  PersonaController.deletePersona
);
router.get(
  routes.CONNECTION_PERSONA,
  passport.authenticate(['jwt', 'clientBasic'], DEFAULT_PASSPORT_OPTIONS),
  PersonaController.personaConnection
);
router.post(
  routes.MERGE_PERSONA,
  passport.authenticate(['jwt', 'clientBasic'], DEFAULT_PASSPORT_OPTIONS),
  PersonaController.mergePersona
);

router.post(
  routes.MERGE_PERSONA,
  passport.authenticate(['jwt', 'clientBasic'], DEFAULT_PASSPORT_OPTIONS),
  PersonaController.mergePersona
);

export default router;
