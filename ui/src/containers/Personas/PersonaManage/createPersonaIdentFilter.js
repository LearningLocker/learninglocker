import { Map } from 'immutable';

export default personaId => new Map({ persona: new Map({ $oid: personaId }) });
