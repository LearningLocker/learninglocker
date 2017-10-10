import personaService from 'personas/dist/service';
import mongoModelsRepo from 'personas/dist/mongoModelsRepo';
import config from 'personas/dist/config';
import { MongoClient } from 'mongodb';

export default () => {
  const service = personaService({
    repo: mongoModelsRepo({
      db: MongoClient.connect(
        process.env.MONGODB_PATH,
        config.mongoModelsRepo.options
      )
    })
  });

  return (req, res, next) => {
    req.personaService = service;

    next();
  };
};
