import mongoose from 'mongoose';
import Promise from 'bluebird';
import logger from 'lib/logger';
import defaultTo from 'lodash/defaultTo';

/** @typedef {module:mongoose.Connection} MongooseConnection */

mongoose.Promise = Promise;
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

const poolSize = defaultTo(Number(process.env.MONGO_CONNECTION_POOLSIZE), 20);
// Default timeout to 5 minutes
const socketTimeoutMS = defaultTo(Number(process.env.MONGO_SOCKET_TIMEOUT_MS), 300000);
const ssl = defaultTo(Boolean(process.env.MONGO_SSL === 'true'), false);
const sslCA = defaultTo(String(process.env.MONGO_CA_PATH), null);

/** @returns {MongooseConnection} */
const createConnection = () => {
  const dbpath = process.env.MONGODB_PATH;
  const serverOptions = {
    socketTimeoutMS,
    poolSize,
    ssl,
    sslCA
  };

  logger.silly('Creating Mongo connection', dbpath, serverOptions);
  return mongoose.createConnection(dbpath, {
    promiseLibrary: Promise,
    ...serverOptions
  });
};

/** @type {Object<string, MongooseConnection>} */
const connections = {};
/** @returns {Object<string, MongooseConnection>} */
const getConnections = () => connections;

/**
 * @param {string} namespace
 * @returns {MongooseConnection}
 */
const getConnection = (namespace = 'll') => {
  if (connections[namespace]) return connections[namespace];
  connections[namespace] = createConnection();
  connections[namespace].on('error', console.error);
  return connections[namespace];
};

export {
  getConnection,
  getConnections
};
