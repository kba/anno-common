#!/bin/bash
lerna bootstrap
ANNO_AUTH_BACKEND="plain" \
ANNO_COLLECTION_FILE="$PWD/../../config/collections.yml" \
node auth-server.js
