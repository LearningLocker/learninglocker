import logger from 'lib/logger';
import * as Queue from 'lib/services/queue';
import {
  PERSONA_IMPORT_QUEUE
} from 'lib/constants/personasImport';
import getPersonaService from 'lib/connections/personaService';
import importPersonaHandler from './importPersonaHandler';

const defaultHandleResponse = (err) => {
  if (err) logger.error('ERROR SUBSCRIBING TO QUEUE', err);
  return err;
};

export default () => {
  const personaService = getPersonaService();

  Queue.subscribe({
    queueName: PERSONA_IMPORT_QUEUE,
    handler: importPersonaHandler(personaService)
  }, defaultHandleResponse);
};
