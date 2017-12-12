import { Map } from 'immutable';

export default (personaId) => {
  return new Map({ persona: personaId });
};
