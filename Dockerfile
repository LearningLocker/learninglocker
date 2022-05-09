FROM node:10-stretch AS builder

# Target: base-development
ENV NODE_ENV=development

RUN apt-get update && apt-get -y install \
openssl \
curl \
git \
python \
build-essential \
xvfb \
apt-transport-https

RUN mkdir /learninglocker/
# Copy all sourcecode
COPY ./ /learninglocker/

WORKDIR /learninglocker/

COPY package.json yarn.lock ./
RUN npm_config_build_from_source=true \
  yarn install \
  --ignore-engines \
  --non-interactive \
  --pure-lockfile

RUN yarn run build-api-server
RUN yarn run build-ui-server
RUN yarn run build-ui-client
RUN yarn run build-cli-server
RUN yarn run build-worker-server

# Prepare production stage
FROM node:10-stretch-slim AS production

ENV NODE_ENV=production

# Unique string used for hashing
# It is critical to override this value in deployed enviroments
ENV APP_SECRET=mK9WhQrEU2xAXktaHFJ6rZzwg9ufZZLREzk2758QGQAkfkHDeaRxfezbSKrkFRWj

# Site URL (used for emails)
ENV SITE_URL=http://127.0.0.1
ENV API_HOST=127.0.0.1
ENV UI_PORT=3000
ENV API_PORT=8080

# Logging #
ENV LOG_MIN_LEVEL=debug
ENV LOG_DIR=logs
ENV COLOR_LOGS=false
# AWS Cloudwatch logs #
# AWS credentials must be configured for Cloudwatch access
ENV WINSTON_CLOUDWATCH_ENABLED=false

# Mongo URL # 
ENV MONGODB_PATH=mongodb://mongodb:27017/learninglocker_v2
ENV MONGO_CONNECTION_POOLSIZE=20
ENV MONGO_SOCKET_TIMEOUT_MS=300000
ENV MONGO_SSL=false

# Redis URL #
# The URL of your Redis instance e.g. redis://127.0.0.1:6379/0
ENV REDIS_URL=redis://redis:6379/0
ENV REDIS_PREFIX=LEARNINGLOCKER

# Ensure Google OAuth is disabled
ENV GOOGLE_ENABLED=false

# Queues #
ENV QUEUE_PROVIDER=REDIS
ENV QUEUE_NAMESPACE=LEARNINGLOCKER

# The file storage type (local*|amazon|google|azure)
ENV FS_REPO=local

# Settings for deployed/production enviroments #
#SITE_URL=test.beta.jisc.ac.uk
#APP_SECRET=<256bit-secret-string>
#REDIS_URL=redis://redis:6379/0
#MONGODB_PATH=mongodb://mongodb:27017/learninglocker_v2
#WINSTON_CLOUDWATCH_ENABLED=
#WINSTON_CLOUDWATCH_LOG_GROUP_NAME=
#WINSTON_CLOUDWATCH_LOG_STREAM_NAME=
#WINSTON_CLOUDWATCH_ACCESS_KEY_ID=
#WINSTON_CLOUDWATCH_SECRET_ACCESS_KEY=
#WINSTON_CLOUDWATCH_REGION=

RUN mkdir /learninglocker/
WORKDIR /learninglocker/

RUN apt-get update && apt-get -y install \
  openssl \
  curl \
  git \
  python \
  build-essential \
  xvfb \
  apt-transport-https

COPY package.json yarn.lock ./
RUN npm_config_build_from_source=true \
  yarn install \
  --ignore-engines \
  --non-interactive \
  --pure-lockfile \
  --production

# .env file is required, but we can use enviroment variables instead
RUN touch .env

CMD node server

# Target: API Server
FROM production AS api
COPY --from=builder /learninglocker/api/dist/server /learninglocker/server
COPY --from=builder /learninglocker/api/healthcheck.sh /healthcheck.sh
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD sh /healthcheck.sh

# Target: Client Server
FROM production AS clientserver
COPY --from=builder /learninglocker/ui/dist/server /learninglocker/server

# Target: CLI Utilities
FROM production AS cli
COPY --from=builder /learninglocker/cli/dist/server /learninglocker/server
CMD printf "The CLI Utilities are mostly used for migrating and rolling back the mongo database:\n \
   migrateMongo --up\n \
   migrateMongo --down last\n \
For more commands see: cli/src/server.js in the LearningLocker soruce code\n"

# Target: Scheduler
FROM production AS scheduler
COPY --from=builder /learninglocker/cli/dist/scheduler /learninglocker/server

# Target: Worker
FROM production AS worker
COPY --from=builder /learninglocker/worker/dist/server /learninglocker/server

# Target: Nginx
FROM nginx:1.22 AS nginx
COPY --from=builder /learninglocker/ui/dist/public /learninglocker/public
COPY nginx.conf.example /etc/nginx/conf.d/default.conf
