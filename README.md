# Learning Locker v2

![Build Status](https://travis-ci.com/LearningLocker/learninglocker_node.svg?token=bhrQ2VaxsFy5LxzSAinN&branch=master)

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
<<<<<<< HEAD

# Requirements
Redis ^2.8.11
