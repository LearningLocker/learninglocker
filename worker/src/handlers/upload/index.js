import personaUploadHandler from 'worker/handlers/upload/personaUploadHandler';
import * as Queue from 'lib/services/queue';
import { PERSON_UPLOAD_QUEUE } from 'lib/constants/uploads';
import logger from 'lib/logger';

const handleResponse = (err) => {
  if (err) logger.error('ERROR SUBSCRIBING TO QUEUE', err);
};

export default () => {
  Queue.subscribe({
    queueName: PERSON_UPLOAD_QUEUE,
    handler: personaUploadHandler
  }, handleResponse);
};
