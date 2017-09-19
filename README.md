# Learning Locker v2

[![Build Status](https://travis-ci.org/LearningLocker/learninglocker.svg?branch=v2)](https://travis-ci.org/LearningLocker/learninglocker)

###  Instructions

1. Install pm2 - http://pm2.keymetrics.io/docs/usage/quick-start/
1. Install yarn - https://yarnpkg.com/en/
1. Run `yarn install`
1. Copy .env.example to .env
1. Configure the .env

#### Development
1. `yarn dev-api-server -- --watch`
1. `yarn dev-ui-server`
1. `yarn dev-ui-client`
1. `pm2 start process.json`

#### Production
1. Copy the `.nginx.conf.example`
1. Configure the Nginx config
1. `yarn build-all`
1. `pm2 start process.json`

# Requirements
Redis ^2.8.11
MongoDB ^3.2
Node.js ^6.11.3
