const cachePrefix = (key = null) => {
  const prefix = process.env.REDIS_PREFIX || false;
  if (!prefix) return key;
  return `${prefix}:${key}`;
};

export default cachePrefix;
