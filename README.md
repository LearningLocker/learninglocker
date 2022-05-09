[![Learning Locker Logo](https://i.imgur.com/hP1yFKL.png)](http://learninglocker.net)
> An open source Learning Record Store (LRS) implementing the [xAPI](https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md) ([Tin Can API](http://tincanapi.com/)).

[![Build Status](https://travis-ci.org/LearningLocker/learninglocker.svg?branch=master)](https://travis-ci.org/LearningLocker/learninglocker)
[![License](https://poser.pugx.org/learninglocker/learninglocker/license.svg)](http://opensource.org/licenses/GPL-3.0)
[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/LearningLocker/learninglocker?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

*Learning Locker is copyright [Learning Pool](https://learningpool.com/)*

Please see our [documentation](http://docs.learninglocker.net) for installation, configuration, and usage instructions.

You can also [register your Learning Locker](https://learningpool.com/register-locker) or get [Learning Locker Data Cloud](https://learningpool.com/solutions/learning-record-store-learning-locker).

# Create a user

```bash
docker-compose run cli node server createSiteAdmin  "example@email.com" "Your organisation name" "123456"
```

# Troubleshoot healhchecks

```bash
docker inspect --format "{{json .State.Health }}" learninglocker_api | jq 
```
