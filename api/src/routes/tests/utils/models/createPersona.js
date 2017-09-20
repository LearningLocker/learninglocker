import testId from 'api/routes/tests/utils/testId';
import Persona from 'lib/models/persona';

export default () =>
  Persona.create({
    name: 'Persona',
    organisation: testId,
    identifiers: [],
    personStatements: [],
    personStudents: []
  });
