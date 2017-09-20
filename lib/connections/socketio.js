import io from 'socket.io';
import redis from 'socket.io-redis';

let _io;

const get = () => _io;

const set = (httpServer) => {
  _io = io(httpServer);
  _io.adapter(redis({ host: process.env.REDIS_HOST, port: process.env.REDIS_PORT }));
  return _io;
};

export default {
  get,
  set
};
