import logger from 'lib/logger';
import * as Queue from 'lib/services/queue';
import {
  PERSONA_IMPORT_QUEUE
} from 'lib/constants/personasImport';
import getPersonaService from 'lib/connections/personaService';
import importPersonaHandler from './importPersonaHandler';

const defaultHandleResponse = (err) => {
  if (err) logger.error(`ERROR SUBSCRIBING TO QUEUE ${PERSONA_IMPORT_QUEUE}`, err);
  return err;
};

export default ({
  onProcessed
}) => {
  const personaService = getPersonaService();

  Queue.subscribe({
    queueName: PERSONA_IMPORT_QUEUE,
    handler: importPersonaHandler(personaService),
    onProcessed
  }, defaultHandleResponse);
};
