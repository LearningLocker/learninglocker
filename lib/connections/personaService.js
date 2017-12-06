import personaService from 'personas/dist/service';
import mongoModelsRepo from 'personas/dist/mongoModelsRepo';
import config from 'personas/dist/config';
import createMongoClient from 'personas/dist/repoFactory/utils/createMongoClient';

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
