import personaService from 'personas/dist/service';
import mongoModelsRepo from 'personas/dist/mongoModelsRepo';
import config from 'personas/dist/config';
// import { MongoClient } from 'mongodb';
import createMongoClient from 'personas/dist/repoFactory/utils/createMongoClient';

export default () => {
  const service = personaService({
    repo: mongoModelsRepo({
      db: createMongoClient({
        url: process.env.MONGODB_PATH,
        options: config.mongoModelsRepo.options
      })
    })
  });

  return (req, res, next) => {
    req.personaService = service;

    next();
  };
};
