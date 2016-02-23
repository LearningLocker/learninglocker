#!/usr/bin/env sh

DEVELOP="develop"

if [ "${DEVELOP}" = "${TRAVIS_BRANCH}" ]; then
  echo "Running conformance tests."

  # Starts the server.
  sudo chmod -R 777 *
  php artisan serve --env=testing --host 0.0.0.0 --port=8000 &

  # Creates a new User.
  mongo ll_staging --eval 'db.users.insert({"name" : "Test User", "email" : "test@example.com", "verified" : "yes", "role" : "super", "password" : "$2y$10$MKDC2thihULF3fNuVj.DyORidVd.airmxZicEcSrpNQRsJMX3ZGBW"})'

  # Creates a new LRS.
  mongo ll_staging --eval 'db.lrs.insert({"title" : "Conformance", "description" : "",  "owner_id" : db.users.find()[0]._id})'

  # Creates a new Client.
  mongo ll_staging --eval 'db.client.insert({"api" : { "basic_key" : "1484c2ac05269b8c5479a1dd6a0d6370991fd6a1", "basic_secret" : "f0ef3d8062805c0fc1675beb8ac0715c75df13cb" }, "lrs_id" : db.lrs.find()[0]._id, "authority" : { "name" : "New Client", "mbox" : "mailto:hello@learninglocker.net" }, "scopes" : [ "all" ]})'

  # Runs the test suite.
  git clone https://github.com/ryansmith94/xAPI_LRS_Test.git conformance > /dev/null
  cd conformance
  git checkout travis > /dev/null
  cd src
  npm install -g grunt-cli > /dev/null
  npm install > /dev/null
  grunt --bail --reporter=dot --endpoint="http://0.0.0.0:8000/data/xAPI/" --username="1484c2ac05269b8c5479a1dd6a0d6370991fd6a1" --password="f0ef3d8062805c0fc1675beb8ac0715c75df13cb" --xapi-version="1.0.1" || exit 1;

  # Stops the server.
  ps aux | grep [p]hp | awk '{print $2}' | xargs kill
  echo "Stopped the server."

  echo "Completed conformance tests."
else
  echo "Not running conformance tests."
fi
