import { getConnection } from 'lib/connections/mongoose';

const up = async () => {
  const connection = getConnection();
  await connection.collection('oAuthTokens').createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 });
};

const down = async () => {
  const connection = getConnection();
  await connection.collection('oAuthTokens').drop();
};

export default { up, down };
