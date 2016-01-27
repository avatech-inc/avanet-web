#!/usr/bin/env bash

COMMIT="$(git rev-parse --short HEAD)"

curl https://app.getsentry.com/api/0/projects/avatech/web-client/releases/ \
  -u c8d2219c66e54cb1bfe5142927bbc116: \
  -X POST \
  -d '{"version": "'$COMMIT'"}' \
  -H 'Content-Type: application/json'

curl https://app.getsentry.com/api/0/projects/avatech/web-client/releases/$COMMIT/files/ \
  -u c8d2219c66e54cb1bfe5142927bbc116: \
  -X POST \
  -F file=@avanet.js.map \
  -F name="https://avanet.avatech.com/avanet.js.map"

mv vendor.js.map ./build/assets/
