import testId from 'api/routes/tests/utils/testId';
import getPersonaService from 'lib/connections/personaService';

export default async () => {
  const service = getPersonaService();
  const { persona } = await service.createPersona({
    organisation: testId,
    name: 'Persona'
  });
  return persona;
};
