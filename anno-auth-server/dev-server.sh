#!/bin/bash
lerna bootstrap --hoist
ANNO_AUTH_BACKEND="plain" \
ANNO_COLLECTION_FILE="$PWD/../../config/collections.yml" \
node auth-server.js
