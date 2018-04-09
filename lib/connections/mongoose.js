import mongoose from 'mongoose';
import Promise from 'bluebird';
import defaultTo from 'lodash/defaultTo';

mongoose.Promise = Promise;

const poolSize = defaultTo(Number(process.env.MONGO_CONNECTION_POOLSIZE), 20);
// Default timeout to 5 minutes
const socketTimeoutMS = defaultTo(Number(process.env.MONGO_SOCKET_TIMEOUT_MS), 300000);

const createConnection = () => {
  const dbpath = process.env.MONGODB_PATH;
  return mongoose.createConnection(dbpath, {
    promiseLibrary: Promise,
    socketTimeoutMS,
    poolSize
  });
};

const connections = {};
const getConnections = () => connections;

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
