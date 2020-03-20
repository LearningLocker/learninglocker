#!/usr/bin/env bash

echo 'Removing "cli/src/node_modules"'
rm -R -f cli/src/node_modules

echo 'Removing "worker/src/node_modules"'
rm -R -f worker/src/node_modules

echo 'Removing "api/src/node_modules"'
rm -R -f api/src/node_modules

echo 'Removing "ui/src/node_modules"'
rm -R -f ui/src/node_modules


echo 'Removing "cli/dist"'
rm -R -f cli/dist

echo 'Removing "worker/dist"'
rm -R -f worker/dist

echo 'Removing "api/dist"'
rm -R -f api/dist

echo 'Removing "ui/dist"'
rm -R -f ui/dist

