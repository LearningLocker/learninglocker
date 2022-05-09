# bin/sh
# LearningPool API health-check.

# LearningLocker is developed to stay always up, even after the application has fallen into an unknown state and needs restarting.
# For example, try restarting the Mongo database, LearningPool API should report UNHEALTHY.

# HEALTHY: Provide a non authorised credential and expect the application to return a 401 (unauthorised) status code.
# UNHEALTHY: If the application is in a broken state, it will return a 500 (internal server error) status code.

unauthorized=401
healthcheck=$(curl \
  --silent \
  --output /dev/stderr -o /dev/stderr \
  -w '%{http_code}' \
  "http://127.0.0.1:${API_PORT-8080}/auth/jwt/password" \
  -X POST \
  -u nouser:nopassword --basic)

if [ $healthcheck -eq $unauthorized ]
then
  # Health check succeeded
  exit 0
else
  # Health check failed
  echo "😭 Health-check failed. We've got a response code ${unauthorized} which is not the expected 401 (Unauthorised) response. If this fails a few times in a row, AWS ECS will restart the Task to try to autoheal the service."
  exit 1
fi
