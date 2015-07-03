#!/usr/bin/env sh

DEVELOP="issue/conformance-tests"

if [ "${DEVELOP}" = "${TRAVIS_BRANCH}" ]; then
  echo "Running conformance tests."
  # Starts the server.
  php artisan serve --env=testing --port=8080 &

  # Creates a new LRS.
  mongo lltest --eval 'db.lrs.insert({"title" : "Conformance", "description" : ""})'

  # Creates a new Client.
  mongo lltest --eval 'db.client.insert({"api" : { "basic_key" : "1484c2ac05269b8c5479a1dd6a0d6370991fd6a1", "basic_secret" : "f0ef3d8062805c0fc1675beb8ac0715c75df13cb" }, "lrs_id" : db.lrs.find()[0]._id, "authority" : { "name" : "New Client", "mbox" : "mailto:hello@learninglocker.net" }, "scopes" : [ "all" ]})'

  # Runs the test suite.
  git clone https://github.com/ryansmith94/xAPI_LRS_Test.git conformance > /dev/null
  cd conformance
  git checkout develop > /dev/null
  cd src
  npm install -g grunt-cli > /dev/null
  npm install > /dev/null
  grunt --bail --config="testing.config.json" > /dev/null

  # Stops the server.
  ps aux | grep [p]hp | awk '{print $1}' | xargs kill

  echo "Completed conformance tests."
else
  echo "Not running conformance tests."
fi