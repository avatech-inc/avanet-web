#!/usr/bin/env bash

curl -X POST \
     -H 'Content-type: application/json' \
     --data "{\"text\": \"$1\"}" \
     https://hooks.slack.com/services/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
