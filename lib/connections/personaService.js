import personaService from 'personas/dist/service';
import mongoModelsRepo from 'personas/dist/mongoModelsRepo';
import config from 'personas/dist/config';
import { MongoClient } from 'mongodb';

let service;

const getService = () => {
  if (service) return service;

  service = personaService({
    repo: mongoModelsRepo({
      db: MongoClient.connect(
        process.env.MONGODB_PATH,
        config.mongoModelsRepo.options
      )
    })
  });

  return service;
};

export default getService;
