import personaService from '@learninglocker/persona-service/dist/service';
import mongoModelsRepo from '@learninglocker/persona-service/dist/mongoModelsRepo';
import config from '@learninglocker/persona-service/dist/config';
import createMongoClient from '@learninglocker/persona-service/dist/repoFactory/utils/createMongoClient';

let service;

const getService = () => {
  if (service) return service;

  service = personaService({
    repo: mongoModelsRepo({
      db: createMongoClient({
        url: process.env.MONGODB_PATH,
        options: config.mongoModelsRepo.options
      })
    })
  });

  return service;
};

export default getService;
