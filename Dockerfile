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

CMD node server

# Target: API Server
FROM production AS api
COPY --from=builder /learninglocker/api/dist/server /learninglocker/server

# Target: Client Server
FROM production AS clientserver
COPY --from=builder /learninglocker/ui/dist/server /learninglocker/server

# Target: Client UI
FROM production AS clientui
COPY --from=builder /learninglocker/ui/dist/public /learninglocker/public
CMD echo "TODO: upload assets to S3"

# Target: CLI Utilities
FROM production AS cli
COPY --from=builder /learninglocker/api/dist/server /learninglocker/server
COPY --from=builder /learninglocker/api/dist/scheduler /learninglocker/scheduler
CMD echo "TODO: Print list of available commands"

# Target: Worker
FROM production AS worker
COPY --from=builder /learninglocker/worker/dist/server /learninglocker/server
