import { map } from 'bluebird';
import { head, tail } from 'lodash';
import {
  getPersonaName,
  getIfis
} from 'lib/helpers/personasImport';

export default ({
  structure,
  organisation,
  personaService
}) => async (row) => {
  const personaName = getPersonaName({
    structure,
    row
  });

  const ifis = getIfis({
    structure,
    row
  });

  if (ifis.length === 0) {
    // Do nothing, no ifi's to match.
  }

  const personaIdentifers = await map(
    ifis,
    ifi => personaService.createUpdateIdentifierPersona({
      organisation,
      personaName,
      ifi
    })
  );

  const personaIds = await map(personaIdentifers, ({ personaId }) => personaId);
  const toPersonaId = head(personaIds);
  const fromPersonaIds = tail(personaIds);

  await map(fromPersonaIds, (fromPersonaId) => {
    personaService.mergePersona({
      organisation,
      toPersonaId,
      fromPersonaId
    });
  });
};
